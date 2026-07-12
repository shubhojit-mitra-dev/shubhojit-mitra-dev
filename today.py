import datetime
from dateutil import relativedelta
import requests
import os
from lxml import etree
import time
import hashlib
import json
import random
import yaml

# Check if access token is available. If running locally, we can fall back to a mock or raise.
ACCESS_TOKEN = os.environ.get('ACCESS_TOKEN')
USER_NAME = os.environ.get('USER_NAME', 'shubhojit-mitra-dev')

if ACCESS_TOKEN:
    HEADERS = {'authorization': 'token ' + ACCESS_TOKEN}
else:
    HEADERS = {}

QUERY_COUNT = {'user_getter': 0, 'prs_issues_getter': 0, 'graph_repos_stars': 0, 'recursive_loc': 0, 'graph_commits': 0, 'loc_query': 0}
OWNER_ID = None

def load_config():
    with open('config.yaml', 'r') as f:
        return yaml.safe_load(f)

def daily_readme(birthday):
    """
    Returns the length of time since birthday
    e.g. 'XX years, XX months, XX days'
    """
    diff = relativedelta.relativedelta(datetime.date.today(), birthday.date())
    return '{} {}, {} {}, {} {}{}'.format(
        diff.years, 'year' + format_plural(diff.years), 
        diff.months, 'month' + format_plural(diff.months), 
        diff.days, 'day' + format_plural(diff.days),
        ' 🎂' if (diff.months == 0 and diff.days == 0) else '')

def format_plural(unit):
    return 's' if unit != 1 else ''

def simple_request(func_name, query, variables):
    if not ACCESS_TOKEN:
        print(f"[Warning] ACCESS_TOKEN not set. Mocking response for {func_name}")
        return None
    request = requests.post('https://api.github.com/graphql', json={'query': query, 'variables':variables}, headers=HEADERS)
    if request.status_code == 200:
        return request
    raise Exception(f"{func_name} has failed with a {request.status_code} {request.text} {QUERY_COUNT}")

def graph_commits(start_date, end_date):
    query_count('graph_commits')
    query = '''
    query($start_date: DateTime!, $end_date: DateTime!, $login: String!) {
        user(login: $login) {
            contributionsCollection(from: $start_date, to: $end_date) {
                contributionCalendar {
                    totalContributions
                }
            }
        }
    }'''
    variables = {'start_date': start_date,'end_date': end_date, 'login': USER_NAME}
    request = simple_request(graph_commits.__name__, query, variables)
    if not request:
        return 1234 # Mock data
    return int(request.json()['data']['user']['contributionsCollection']['contributionCalendar']['totalContributions'])

def get_all_commits():
    # Iterate from account creation year to current year
    start_year = 2020 # reasonable default, user registered around then
    current_year = datetime.datetime.now().year
    total = 0
    for year in range(start_year, current_year + 1):
        start_date = f"{year}-01-01T00:00:00Z"
        end_date = f"{year}-12-31T23:59:59Z"
        total += graph_commits(start_date, end_date)
    return total

def graph_repos_stars(count_type, owner_affiliation, cursor=None):
    query_count('graph_repos_stars')
    query = '''
    query ($owner_affiliation: [RepositoryAffiliation], $login: String!, $cursor: String) {
        user(login: $login) {
            repositories(first: 100, after: $cursor, ownerAffiliations: $owner_affiliation) {
                totalCount
                edges {
                    node {
                        ... on Repository {
                            nameWithOwner
                            stargazers {
                                totalCount
                            }
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }'''
    variables = {'owner_affiliation': owner_affiliation, 'login': USER_NAME, 'cursor': cursor}
    request = simple_request(graph_repos_stars.__name__, query, variables)
    if not request:
        if count_type == 'repos':
            return 45
        return 150
    if count_type == 'repos':
        return request.json()['data']['user']['repositories']['totalCount']
    elif count_type == 'stars':
        return stars_counter(request.json()['data']['user']['repositories']['edges'])

def stars_counter(edges):
    total_stars = 0
    for node in edges:
        total_stars += node['node']['stargazers']['totalCount']
    return total_stars

def recursive_loc(owner, repo_name, data, cache_comment, addition_total=0, deletion_total=0, my_commits=0, cursor=None):
    query_count('recursive_loc')
    query = '''
    query ($repo_name: String!, $owner: String!, $cursor: String) {
        repository(name: $repo_name, owner: $owner) {
            defaultBranchRef {
                target {
                    ... on Commit {
                        history(first: 100, after: $cursor) {
                            totalCount
                            edges {
                                node {
                                    author {
                                        name
                                        email
                                        user {
                                            id
                                        }
                                    }
                                    deletions
                                    additions
                                }
                            }
                            pageInfo {
                                endCursor
                                hasNextPage
                            }
                        }
                    }
                }
            }
        }
    }'''
    variables = {'repo_name': repo_name, 'owner': owner, 'cursor': cursor}
    max_retries = 3
    request = None
    for attempt in range(max_retries):
        try:
            request = requests.post('https://api.github.com/graphql', json={'query': query, 'variables':variables}, headers=HEADERS)
            if request.status_code == 200:
                break
            elif request.status_code in [502, 503, 504] and attempt < max_retries - 1:
                print(f"Got {request.status_code} in recursive_loc for {repo_name}. Retrying in 2 seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(2)
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Network error in recursive_loc: {e}. Retrying in 2 seconds...")
                time.sleep(2)
            else:
                raise e

    if request is not None and request.status_code == 200:
        ref = request.json()['data']['repository']['defaultBranchRef']
        if ref is not None:
            return loc_counter_one_repo(owner, repo_name, data, cache_comment, ref['target']['history'], addition_total, deletion_total, my_commits)
        else:
            return 0, 0, 0
            
    status_code = request.status_code if request is not None else 'Unknown'
    text = request.text if request is not None else 'No response'
    raise Exception(f"recursive_loc() failed with {status_code} {text}")

def loc_counter_one_repo(owner, repo_name, data, cache_comment, history, addition_total, deletion_total, my_commits):
    global OWNER_ID
    for node in history['edges']:
        author = node['node'].get('author')
        if not author:
            continue
        
        is_me = False
        if author.get('user') and author['user'].get('id') == OWNER_ID:
            is_me = True
        
        email = author.get('email', '').lower()
        if not is_me and email:
            if (email == 'shubhojit.120225@stu.upes.ac.in' or 
                email == 'shubhojitmitra@outlook.com' or 
                'shubhojit-mitra-dev' in email or 
                'blackknight05' in email):
                is_me = True
                
        name = author.get('name', '').lower()
        if not is_me and name:
            if name in ['shubhojit mitra', 'shubhojit-mitra-dev', 'blackknight05', 'shubhojitmitra']:
                is_me = True
                
        if is_me:
            my_commits += 1
            addition_total += node['node']['additions']
            deletion_total += node['node']['deletions']

    if history['edges'] == [] or not history['pageInfo']['hasNextPage']:
        return addition_total, deletion_total, my_commits
    else:
        return recursive_loc(owner, repo_name, data, cache_comment, addition_total, deletion_total, my_commits, history['pageInfo']['endCursor'])

def read_loc_cache_fallback(comment_size=7):
    filename = 'cache/' + hashlib.sha256(USER_NAME.encode('utf-8')).hexdigest() + '.txt'
    loc_add, loc_del = 0, 0
    try:
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                lines = f.readlines()[comment_size:]
            for line in lines:
                parts = line.split()
                if len(parts) >= 5:
                    loc_add += int(parts[3])
                    loc_del += int(parts[4])
            if loc_add > 0:
                print(f"Loaded fallback LOC from cache: additions={loc_add}, deletions={loc_del}")
                return [loc_add, loc_del, loc_add - loc_del, True]
    except Exception as e:
        print(f"Error reading LOC fallback from cache: {e}")
    return [250000, 50000, 200000, True]

def loc_query(owner_affiliation, comment_size=0, force_cache=False, cursor=None, edges=[]):
    if not ACCESS_TOKEN:
        return [250000, 50000, 200000, True]
    query_count('loc_query')
    query = '''
    query ($owner_affiliation: [RepositoryAffiliation], $login: String!, $cursor: String) {
        user(login: $login) {
            repositories(first: 60, after: $cursor, ownerAffiliations: $owner_affiliation) {
            edges {
                node {
                    ... on Repository {
                        nameWithOwner
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    history {
                                        totalCount
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }'''
    variables = {'owner_affiliation': owner_affiliation, 'login': USER_NAME, 'cursor': cursor}
    request = simple_request(loc_query.__name__, query, variables)
    if request.json()['data']['user']['repositories']['pageInfo']['hasNextPage']:
        edges += request.json()['data']['user']['repositories']['edges']
        return loc_query(owner_affiliation, comment_size, force_cache, request.json()['data']['user']['repositories']['pageInfo']['endCursor'], edges)
    else:
        return cache_builder(edges + request.json()['data']['user']['repositories']['edges'], comment_size, force_cache)

def cache_builder(edges, comment_size, force_cache, loc_add=0, loc_del=0):
    cached = True
    os.makedirs('cache', exist_ok=True)
    filename = 'cache/' + hashlib.sha256(USER_NAME.encode('utf-8')).hexdigest() + '.txt'
    try:
        with open(filename, 'r') as f:
            data = f.readlines()
    except FileNotFoundError:
        data = []
        if comment_size > 0:
            for _ in range(comment_size):
                data.append('This line is a comment block. Write whatever you want here.\n')
        with open(filename, 'w') as f:
            f.writelines(data)

    if len(data) - comment_size != len(edges) or force_cache:
        cached = False
        flush_cache(edges, filename, comment_size)
        with open(filename, 'r') as f:
            data = f.readlines()

    cache_comment = data[:comment_size]
    data = data[comment_size:]
    for index in range(len(edges)):
        parts = data[index].split()
        if len(parts) < 2:
            parts = [hashlib.sha256(edges[index]['node']['nameWithOwner'].encode('utf-8')).hexdigest(), '0', '0', '0', '0']
        repo_hash, commit_count = parts[0], parts[1]
        if repo_hash == hashlib.sha256(edges[index]['node']['nameWithOwner'].encode('utf-8')).hexdigest():
            try:
                ref = edges[index]['node']['defaultBranchRef']
                if ref is not None:
                    current_count = ref['target']['history']['totalCount']
                    if int(commit_count) != current_count:
                        owner, repo_name = edges[index]['node']['nameWithOwner'].split('/')
                        try:
                            loc = recursive_loc(owner, repo_name, data, cache_comment)
                            data[index] = f"{repo_hash} {current_count} {loc[2]} {loc[0]} {loc[1]}\n"
                        except Exception as repo_err:
                            print(f"Warning: Failed to fetch LOC for {owner}/{repo_name}: {repo_err}. Skipping and keeping previous cache value.")
                            if len(parts) >= 5:
                                data[index] = f"{repo_hash} {current_count} {parts[2]} {parts[3]} {parts[4]}\n"
                            else:
                                data[index] = f"{repo_hash} {current_count} 0 0 0\n"
                else:
                    data[index] = f"{repo_hash} 0 0 0 0\n"
            except TypeError:
                data[index] = f"{repo_hash} 0 0 0 0\n"
    with open(filename, 'w') as f:
        f.writelines(cache_comment)
        f.writelines(data)
    for line in data:
        loc = line.split()
        if len(loc) >= 5:
            loc_add += int(loc[3])
            loc_del += int(loc[4])
    return [loc_add, loc_del, loc_add - loc_del, cached]

def flush_cache(edges, filename, comment_size):
    with open(filename, 'r') as f:
        data = []
        if comment_size > 0:
            data = f.readlines()[:comment_size]
    with open(filename, 'w') as f:
        f.writelines(data)
        for node in edges:
            f.write(hashlib.sha256(node['node']['nameWithOwner'].encode('utf-8')).hexdigest() + ' 0 0 0 0\n')

def force_close_file(data, cache_comment):
    filename = 'cache/' + hashlib.sha256(USER_NAME.encode('utf-8')).hexdigest() + '.txt'
    with open(filename, 'w') as f:
        f.writelines(cache_comment)
        f.writelines(data)
    print('There was an error while writing to the cache file. The file', filename, 'has had the partial data saved.')

def user_getter(username):
    query_count('user_getter')
    query = '''
    query($login: String!){
        user(login: $login) {
            id
            createdAt
        }
    }'''
    variables = {'login': username}
    request = simple_request(user_getter.__name__, query, variables)
    if not request:
        return {'id': 'MOCK_ID'}, '2020-01-01T00:00:00Z'
    return {'id': request.json()['data']['user']['id']}, request.json()['data']['user']['createdAt']

def prs_issues_getter(username):
    query_count('prs_issues_getter')
    query = '''
    query($prs_query: String!, $issues_query: String!) {
      prs: search(query: $prs_query, type: ISSUE, first: 0) {
        issueCount
      }
      issues: search(query: $issues_query, type: ISSUE, first: 0) {
        issueCount
      }
    }'''
    variables = {
        'prs_query': f'author:{username} type:pr',
        'issues_query': f'author:{username} type:issue'
    }
    request = simple_request('prs_issues_getter', query, variables)
    if not request:
        return 50, 20
    data = request.json()['data']
    return int(data['prs']['issueCount']), int(data['issues']['issueCount'])

def query_count(funct_id):
    global QUERY_COUNT
    QUERY_COUNT[funct_id] += 1

def justify_dots(root, element_id, dots_needed):
    dots_needed = int(dots_needed)
    if dots_needed <= 0:
        val = ""
    elif dots_needed == 1:
        val = " "
    elif dots_needed == 2:
        val = ". "
    else:
        val = " " + ("." * (dots_needed - 2)) + " "
    find_and_replace(root, element_id, val)

def format_github_stats(svg, max_chars, repo, contrib, prs, commit, issues, loc_add, loc_del, loc_net):
    split_x = 34
    right_width = max_chars - split_x - 2
    
    repo_s = str(repo)
    contrib_s = str(contrib)
    prs_s = str(prs)
    commit_s = '{:,}'.format(commit) if isinstance(commit, int) else str(commit)
    issues_s = str(issues)
    loc_net_s = '{:,}'.format(loc_net) if isinstance(loc_net, int) else str(loc_net)
    loc_add_s = '{:,}'.format(loc_add) if isinstance(loc_add, int) else str(loc_add)
    loc_del_s = '{:,}'.format(loc_del) if isinstance(loc_del, int) else str(loc_del)
    
    # Line 1: Repos and PRs
    dots_l1_left = split_x - 24 - len(repo_s) - len(contrib_s)
    justify_dots(svg, 'repo_data_dots', dots_l1_left)
    find_and_replace(svg, 'repo_data', repo_s)
    find_and_replace(svg, 'contrib_data', contrib_s)
    
    dots_l1_right = right_width - 4 - len(prs_s)
    justify_dots(svg, 'prs_data_dots', dots_l1_right)
    find_and_replace(svg, 'prs_data', prs_s)
    
    # Line 2: Commits and Issues
    dots_l2_left = split_x - 10 - len(commit_s)
    justify_dots(svg, 'commit_data_dots', dots_l2_left)
    find_and_replace(svg, 'commit_data', commit_s)
    
    dots_l2_right = right_width - 7 - len(issues_s)
    justify_dots(svg, 'issues_data_dots', dots_l2_right)
    find_and_replace(svg, 'issues_data', issues_s)
    
    # Line 3: Lines of Code
    dots_l3_left = split_x - 26 - len(loc_net_s)
    justify_dots(svg, 'loc_data_dots', dots_l3_left)
    find_and_replace(svg, 'loc_data', loc_net_s)
    find_and_replace(svg, 'loc_add', loc_add_s)
    find_and_replace(svg, 'loc_del', loc_del_s)
    
    padding_needed = (max_chars - split_x) - (15 + len(loc_add_s) + len(loc_del_s))
    find_and_replace(svg, 'loc_del_dots', " " * max(0, padding_needed))

def justify_format(root, element_id, new_text, length=0):
    if isinstance(new_text, int):
        new_text = f"{'{:,}'.format(new_text)}"
    new_text = str(new_text)
    find_and_replace(root, element_id, new_text)
    just_len = max(0, length - len(new_text))
    if just_len <= 2:
        dot_map = {0: '', 1: ' ', 2: '. '}
        dot_string = dot_map[just_len]
    else:
        dot_string = ' ' + ('.' * just_len) + ' '
    find_and_replace(root, f"{element_id}_dots", dot_string)

def find_and_replace(root, element_id, new_text):
    element = root.find(f".//*[@id='{element_id}']")
    if element is not None:
        element.text = new_text

def build_svg_base(config, theme_type, ascii_lines):
    theme_colors = config['theme'][theme_type]
    font_family = config['theme']['font_family']
    right_align_x = str(config['theme'].get('right_align_x', 450))
    ascii_font_size = config['theme'].get('ascii_font_size', '10.5px')
    right_font_size = config['theme'].get('right_font_size', '13px')
    width = config['theme'].get('width', '985px')
    height = config['theme'].get('height', '650px')
    
    # Calculate right column dimensions dynamically
    try:
        font_size_num = float(right_font_size.replace('px', '').strip())
        char_width = font_size_num * 0.66
        width_num = float(width.replace('px', '').strip())
        max_chars = int((width_num - int(right_align_x)) / char_width) - 2
    except Exception as e:
        print(f"Error calculating max_chars, fallback to 58: {e}")
        max_chars = 58
    
    svg = etree.Element('svg', xmlns="http://www.w3.org/2000/svg", attrib={
        "width": width,
        "height": height
    })
    
    # CSS Styles
    style = etree.SubElement(svg, 'style')
    style.text = f"""
    .key {{fill: {theme_colors['key']};}}
    .value {{fill: {theme_colors['value']};}}
    .addColor {{fill: {theme_colors['add']};}}
    .delColor {{fill: {theme_colors['delete']};}}
    .cc {{fill: {theme_colors['dots']};}}
    text, tspan {{
        font-family: {font_family};
        white-space: pre;
    }}
    """
    
    # Background rectangle
    etree.SubElement(svg, 'rect', width=width, height=height, fill=theme_colors['bg'], rx="15")
    
    # Left ASCII art
    ascii_text = etree.SubElement(svg, 'text', attrib={
        "x": "15",
        "y": "30",
        "fill": theme_colors['ascii'],
        "font-size": ascii_font_size
    })
    for idx, line in enumerate(ascii_lines):
        y_pos = 30 + (idx * 13.5)
        # Clean line to ensure it doesn't break XML and strip trailing whitespaces
        line_clean = line.rstrip().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        tspan = etree.SubElement(ascii_text, 'tspan', x="15", y=str(y_pos))
        tspan.text = line_clean
        
    # Right column info
    right_text = etree.SubElement(svg, 'text', attrib={
        "x": right_align_x,
        "y": "30",
        "fill": theme_colors['text'],
        "font-size": right_font_size
    })
    
    # Build dynamic layout nodes
    y_idx = 30
    y_step = 20
    
    # Helper to calculate divider line length
    def get_divider_dots(label):
        used = len(label)
        fill_chars = max(0, max_chars - used)
        return "─" * fill_chars
    
    # 1. Header
    header = config['layout']['header']
    tspan = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
    tspan.text = header
    
    # Divider for header
    divider_tspan = etree.SubElement(right_text, 'tspan', attrib={"class": "cc"})
    divider_tspan.text = " " + get_divider_dots(header + " ")
    y_idx += y_step
    
    # 2. System Section
    for item in config['layout']['system']:
        tspan_base = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
        
        # cc prefix dots
        dot_prefix = etree.SubElement(tspan_base, 'tspan', attrib={"class": "cc"})
        dot_prefix.text = ". "
        
        # key
        key_span = etree.SubElement(tspan_base, 'tspan', attrib={"class": "key"})
        key_span.text = item['key']
        
        # colon
        colon_span = etree.SubElement(tspan_base, 'tspan')
        colon_span.text = ":"
        
        # justify dots
        dots_span = etree.SubElement(tspan_base, 'tspan', attrib={"class": "cc"})
        
        # value
        val_span = etree.SubElement(tspan_base, 'tspan', attrib={"class": "value"})
        
        if item['value'] == "[UPTIME]":
            dots_span.set('id', 'age_data_dots')
            val_span.set('id', 'age_data')
        else:
            # For static items we can pre-justify
            length = max_chars - len(item['key']) - 3 # key + prefix + colon
            val_str = item['value']
            just_len = max(0, length - len(val_str))
            dots_span.text = ' ' + ('.' * just_len) + ' '
            val_span.text = val_str
            
        y_idx += y_step
        
    # Spacer
    y_idx += y_step
    
    # 3. Dynamic layout sections (Software, Hobbies, etc.)
    for section_name in config['layout']:
        if section_name.lower() in ['header', 'system', 'contact']:
            continue
            
        section_data = config['layout'][section_name]
        if not section_data or not isinstance(section_data, list):
            continue
            
        # Section divider header
        section_title = f"- {section_name} "
        tspan_sec = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
        tspan_sec.text = section_title
        etree.SubElement(tspan_sec, 'tspan', attrib={"class": "cc"}).text = get_divider_dots(section_title)
        y_idx += y_step
        
        for item in section_data:
            if not isinstance(item, dict) or 'key' not in item or 'value' not in item:
                continue
                
            tspan_base = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
            etree.SubElement(tspan_base, 'tspan', attrib={"class": "cc"}).text = ". "
            
            # Format dotted keys (e.g. Hobbies.Static or Tools.DevOps)
            parts = item['key'].split('.')
            prev_el = None
            for p_idx, part in enumerate(parts):
                el = etree.SubElement(tspan_base, 'tspan', attrib={"class": "key"})
                el.text = part
                if prev_el is not None:
                    prev_el.tail = '.'
                prev_el = el
                
            colon_el = etree.SubElement(tspan_base, 'tspan')
            colon_el.text = ":"
            
            dots_span = etree.SubElement(tspan_base, 'tspan', attrib={"class": "cc"})
            val_str = item['value']
            
            length = max_chars - len(item['key']) - 3 # key + prefix + colon
            just_len = max(0, length - len(val_str))
            dots_span.text = ' ' + ('.' * just_len) + ' '
            
            etree.SubElement(tspan_base, 'tspan', attrib={"class": "value"}).text = val_str
            y_idx += y_step
            
        # Spacer
        y_idx += y_step
        
    # 4. Contact Section
    contact_header = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
    contact_header.text = "- Contact "
    etree.SubElement(contact_header, 'tspan', attrib={"class": "cc"}).text = get_divider_dots("- Contact ")
    y_idx += y_step
    
    for item in config['layout']['contact']:
        if not isinstance(item, dict) or 'key' not in item or 'value' not in item:
            continue
            
        tspan_base = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
        etree.SubElement(tspan_base, 'tspan', attrib={"class": "cc"}).text = ". "
        etree.SubElement(tspan_base, 'tspan', attrib={"class": "key"}).text = item['key']
        etree.SubElement(tspan_base, 'tspan').text = ":"
        
        dots_span = etree.SubElement(tspan_base, 'tspan', attrib={"class": "cc"})
        val_span = etree.SubElement(tspan_base, 'tspan', attrib={"class": "value"})
        
        length = max_chars - len(item['key']) - 3
        just_len = max(0, length - len(item['value']))
        dots_span.text = ' ' + ('.' * just_len) + ' '
        val_span.text = item['value']
        
        y_idx += y_step
        
    # Spacer
    y_idx += y_step
    
    # 5. GitHub Stats Section
    stats_header = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
    stats_header.text = "- GitHub Stats "
    etree.SubElement(stats_header, 'tspan', attrib={"class": "cc"}).text = get_divider_dots("- GitHub Stats ")
    y_idx += y_step
    
    # Line 1: Repos and Stars
    tspan_l1 = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "cc"}).text = ". "
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "key"}).text = "Repos"
    etree.SubElement(tspan_l1, 'tspan').text = ":"
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "cc"}, id="repo_data_dots")
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "value"}, id="repo_data")
    
    etree.SubElement(tspan_l1, 'tspan').text = " {"
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "key"}).text = "Contributed"
    etree.SubElement(tspan_l1, 'tspan').text = ": "
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "value"}, id="contrib_data")
    etree.SubElement(tspan_l1, 'tspan').text = "} | "
    
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "key"}).text = "PRs"
    etree.SubElement(tspan_l1, 'tspan').text = ":"
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "cc"}, id="prs_data_dots")
    etree.SubElement(tspan_l1, 'tspan', attrib={"class": "value"}, id="prs_data")
    
    y_idx += y_step
    
    # Line 2: Commits and Issues
    tspan_l2 = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "cc"}).text = ". "
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "key"}).text = "Commits"
    etree.SubElement(tspan_l2, 'tspan').text = ":"
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "cc"}, id="commit_data_dots")
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "value"}, id="commit_data")
    
    etree.SubElement(tspan_l2, 'tspan').text = " | "
    
    # Issues
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "key"}).text = "Issues"
    etree.SubElement(tspan_l2, 'tspan').text = ":"
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "cc"}, id="issues_data_dots")
    etree.SubElement(tspan_l2, 'tspan', attrib={"class": "value"}, id="issues_data")
    
    y_idx += y_step
    
    # Line 3: Lines of Code
    tspan_l3 = etree.SubElement(right_text, 'tspan', x=right_align_x, y=str(y_idx))
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "cc"}).text = ". "
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "key"}).text = "Lines of Code on GitHub"
    etree.SubElement(tspan_l3, 'tspan').text = ":"
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "cc"}, id="loc_data_dots")
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "value"}, id="loc_data")
    
    etree.SubElement(tspan_l3, 'tspan').text = " ( "
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "addColor"}, id="loc_add")
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "addColor"}).text = "++"
    etree.SubElement(tspan_l3, 'tspan').text = ", "
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "cc"}, id="loc_del_dots").text = ""
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "delColor"}, id="loc_del")
    etree.SubElement(tspan_l3, 'tspan', attrib={"class": "delColor"}).text = "--"
    etree.SubElement(tspan_l3, 'tspan').text = " )"
    
    # Calculate final height dynamically based on content lines
    final_height = y_idx + 40
    svg.set('height', f"{final_height}px")
    bg_rect = svg.find('.//rect')
    if bg_rect is not None:
        bg_rect.set('height', f"{final_height}px")
        
    return svg

def check_scheduler():
    """
    Returns True if we should run stats collection and update SVGs.
    Returns False if we should exit early to honor the random 3-7 day schedule.
    """
    state_file = 'cache/schedule_state.json'
    
    # If workflow dispatch manual trigger or push, always run
    if os.environ.get('GITHUB_EVENT_NAME') in ['workflow_dispatch', 'push']:
        print("Manual trigger or push detected. Forcing execution.")
        return True
        
    try:
        if os.path.exists(state_file):
            with open(state_file, 'r') as f:
                state = json.load(f)
            last_run = datetime.datetime.strptime(state['last_run'], '%Y-%m-%d').date()
            next_interval = state['next_interval']
            days_passed = (datetime.date.today() - last_run).days
            
            print(f"Scheduler state: Last run={last_run}, Next interval={next_interval} days, Days passed={days_passed}")
            if days_passed < next_interval:
                print(f"Skipping run. Only {days_passed} days passed out of required {next_interval}.")
                return False
        else:
            print("No scheduler state found. Running for the first time.")
    except Exception as e:
        print(f"Error reading scheduler state, proceeding with run: {e}")
        
    return True

def save_scheduler_state():
    state_file = 'cache/schedule_state.json'
    next_interval = random.randint(3, 7)
    state = {
        'last_run': str(datetime.date.today()),
        'next_interval': next_interval
    }
    os.makedirs('cache', exist_ok=True)
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)
    print(f"Saved new scheduler state: {state}")

if __name__ == '__main__':
    # 1. Check scheduling rules
    if not check_scheduler():
        print("Early exit to prevent profile git noise.")
        exit(0)

    print('Calculation times:')
    
    # Load config
    config = load_config()
    bday_str = config['profile']['birthday']
    birthday = datetime.datetime.strptime(bday_str, '%Y-%m-%d')
    
    # Get user creation data
    t_start = time.perf_counter()
    OWNER_ID, acc_date = user_getter(USER_NAME)
    
    # Get Pull Requests and Issues
    prs_data, issues_data = prs_issues_getter(USER_NAME)
    
    # Uptime calculation
    age_data = daily_readme(birthday)
    
    # Repos
    repo_data = graph_repos_stars('repos', ['OWNER'])
    contrib_data = graph_repos_stars('repos', ['OWNER', 'COLLABORATOR', 'ORGANIZATION_MEMBER'])
    
    # Commits
    commit_data = get_all_commits()
    
    # Lines of code (cached)
    try:
        total_loc = loc_query(['OWNER', 'COLLABORATOR', 'ORGANIZATION_MEMBER'], 7)
    except Exception as e:
        print(f"Warning: loc_query failed ({e}). Loading fallback from cache...")
        total_loc = read_loc_cache_fallback(7)
    
    # Load ASCII Art
    with open('ascii_art.txt', 'r') as f:
        ascii_lines = f.readlines()
        
    # Formatting
    formatted_total_loc = list(total_loc)
    for idx in range(3):
        formatted_total_loc[idx] = '{:,}'.format(total_loc[idx])
        
    # Calculate right column dimensions dynamically for Uptime alignment
    right_align_x = config['theme'].get('right_align_x', 530)
    right_font_size = config['theme'].get('right_font_size', '13px')
    width = config['theme'].get('width', '985px')
    try:
        font_size_num = float(right_font_size.replace('px', '').strip())
        char_width = font_size_num * 0.66
        width_num = float(width.replace('px', '').strip())
        max_chars = int((width_num - int(right_align_x)) / char_width) - 2
    except:
        max_chars = 58
    age_justify = max_chars - len("Uptime") - 3
        
    # Generate Dark Mode SVG
    svg_dark = build_svg_base(config, 'dark', ascii_lines)
    justify_format(svg_dark, 'age_data', age_data, age_justify)
    format_github_stats(svg_dark, max_chars, repo_data, contrib_data, prs_data, commit_data, issues_data, total_loc[0], total_loc[1], total_loc[2])
    
    with open('dark_mode.svg', 'wb') as f:
        f.write(etree.tostring(svg_dark, pretty_print=False, xml_declaration=True, encoding='utf-8'))
        
    # Generate Light Mode SVG
    svg_light = build_svg_base(config, 'light', ascii_lines)
    justify_format(svg_light, 'age_data', age_data, age_justify)
    format_github_stats(svg_light, max_chars, repo_data, contrib_data, prs_data, commit_data, issues_data, total_loc[0], total_loc[1], total_loc[2])
    
    with open('light_mode.svg', 'wb') as f:
        f.write(etree.tostring(svg_light, pretty_print=False, xml_declaration=True, encoding='utf-8'))

    print(f"Generated SVGs successfully. Total execution time: {time.perf_counter() - t_start:.4f} s")
    
    # Save the scheduler state for the next run
    save_scheduler_state()
