import { useState } from 'react';
import TranslucentTab from './ui/translucentTabs';
import htmlIcon from '../assets/html.svg';
import jsIcon from '../assets/javascript.svg';
import cssIcon from '../assets/css.svg';
import pyIcon from '../assets/python.svg';
import cppIcon from '../assets/cpp.svg';
import reactIcon from '../assets/react.svg';
import nodeIcon from '../assets/node.svg';
import twIcon from '../assets/tailwind.svg';
import gitIcon from '../assets/git.svg';
import tsIcon from '../assets/typescript.svg';
import mongoIcon from '../assets/mongodb.svg';
import nextIcon from '../assets/nextjs.svg';
import figmaIcon from '../assets/figma.svg';
import ghIcon from '../assets/github.svg';
import shadcnIcon from '../assets/shadcn.svg';
import postmanIcon from '../assets/postman.svg';
import CustomButton from './ui/CustomButton';
import javaIcon from '../assets/java.svg';
import reduxIcon from '../assets/redux.svg';
import phpIcon from '../assets/php.svg';
import jqueryIcon from '../assets/jquery.svg';
import reactqueryIcon from '../assets/react-query.svg';
import viteIcon from '../assets/vite.svg';
import zodIcon from '../assets/zod.svg';
import supabaseIcon from '../assets/supabase.svg';
import appwriteIcon from '../assets/appwrite.svg';
import convexIcon from '../assets/convex.svg';
import firebaseIcon from '../assets/firebase.svg';
import prismaIcon from '../assets/prisma.svg';
import drizzleIcon from '../assets/drizzle.svg';
import mysqlIcon from '../assets/mysql.svg';
import postgresIcon from '../assets/postgres.svg';
import dockerIcon from '../assets/docker.svg';
import ghactionsIcon from '../assets/github-actions.svg';
import vercelIcon from '../assets/vercel.svg';
import netlifyIcon from '../assets/netlify.svg';
import railwayIcon from '../assets/railway.svg';
import renderIcon from '../assets/render.svg';
import webflowIcon from '../assets/webflow.svg';
import wordpressIcon from '../assets/wordpress.svg';

const TechStack = () => {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleAccordion = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleScroll = (id, event) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tech stack organized by categories
  const techCategories = [
    {
      name: "Languages",
      technologies: [
        { name: "C++", icon: cppIcon, link: "https://isocpp.org/" },
        { name: "Python", icon: pyIcon, link: "https://www.python.org/" },
        { name: "Java", icon: javaIcon, link: "https://www.java.com/en/" },
        { name: "PHP", icon: phpIcon, link: "https://www.php.net/" },
      ]
    },
    {
      name: "Frontend",
      technologies: [
        { name: "HTML", icon: htmlIcon, link: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
        { name: "CSS", icon: cssIcon, link: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
        { name: "JavaScript", icon: jsIcon, link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
        { name: "jQuery", icon: jqueryIcon, link: "https://jquery.com/" },
        { name: "React", icon: reactIcon, link: "https://reactjs.org/" },
        { name: "Redux", icon: reduxIcon, link: "https://redux.js.org/" },
        { name: "React Query", icon: reactqueryIcon, link: "https://tanstack.com/query/latest" },
        { name: "Vite", icon: viteIcon, link: "https://vitejs.dev/" },
        { name: "Next.js", icon: nextIcon, link: "https://nextjs.org/" },
        { name: "Tailwind CSS", icon: twIcon, link: "https://tailwindcss.com/" },
        { name: "TypeScript", icon: tsIcon, link: "https://www.typescriptlang.org/" },
        { name: "Shadcn", icon: shadcnIcon, link: "https://ui.shadcn.com/" }
      ]
    },
    {
      name: "Backend & Database",
      technologies: [
        { name: "Next.js API Routes", icon: nextIcon, link: "https://nextjs.org/docs/pages/building-your-application/routing/api-routes" },
        { name: "Node.js", icon: nodeIcon, link: "https://nodejs.org/" },
        { name: "Zod", icon: zodIcon, link: "https://zod.dev/" },
        { name: "MongoDB", icon: mongoIcon, link: "https://www.mongodb.com/" },
        { name: "Supabase", icon: supabaseIcon, link: "https://supabase.com/" },
        { name: "Appwrite", icon: appwriteIcon, link: "https://appwrite.io/" },
        { name: "Convex", icon: convexIcon, link: "https://www.convex.dev/" },
        { name: "Firebase", icon: firebaseIcon, link: "https://firebase.google.com/" },
        { name: "Prisma", icon: prismaIcon, link: "https://www.prisma.io/" },
        { name: "Drizzle ORM", icon: drizzleIcon, link: "https://orm.drizzle.team/" },
        { name: "MySQL", icon: mysqlIcon, link: "https://www.mysql.com/" },
        { name: "PostgreSQL", icon: postgresIcon, link: "https://www.postgresql.org/" }
      ]
    },
    {
      name: "DevOps & Hosting",
      technologies: [
        { name: "Git", icon: gitIcon, link: "https://git-scm.com/" },
        { name: "GitHub", icon: ghIcon, link: "https://www.github.com/" },
        { name: "Docker", icon: dockerIcon, link: "https://www.docker.com/" },
        { name: "GitHub Actions", icon: ghactionsIcon, link: "https://docs.github.com/en/actions" },
        { name: "Vercel", icon: vercelIcon, link: "https://vercel.com/" },
        { name: "Netlify", icon: netlifyIcon, link: "https://www.netlify.com/" },
        { name: "Render", icon: renderIcon, link: "https://render.com/" },
        { name: "Railway", icon: railwayIcon, link: "https://railway.app/" }
      ]
    },
    {
      name: "Others",
      technologies: [
        { name: "Figma", icon: figmaIcon, link: "https://www.figma.com/" },
        { name: "Webflow", icon: webflowIcon, link: "https://webflow.com/" },
        { name: "Postman", icon: postmanIcon, link: "https://www.postman.com/" },
        { name: "WordPress", icon: wordpressIcon, link: "https://wordpress.com/" },
      ]
    }
  ];

  return (
    <div className='relative flex justify-center items-center p-4 sm:mb-0' style={{ height: 'auto', minHeight: '100vh' }}>
      <div className='absolute top-0 left-0 w-full h-full bg-black opacity-75'></div>
      <div className='relative text-center w-full max-w-5xl mx-auto'>
        <h1 className='text-white text-3xl sm:text-5xl font-bold mb-12 mt-0 sm:mt-0'>👨‍💻 Tech Stack</h1>
        
        <div className="bg-transparent bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg mb-8">
          {techCategories.map((category, index) => (
            <div key={index} className="border-b border-gray-700 last:border-b-0">
              <button
                className="w-full text-left px-6 py-5 flex justify-between items-center text-white hover:bg-[rgba(59,130,246,0.5)] focus:outline-none hover:rounded-lg hover:shadow-lg"
                onClick={() => toggleAccordion(index)}
                aria-expanded={openCategory === index}
              >
                <span className="text-xl font-bold">{category.name}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${openCategory === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openCategory === index ? 'max-h-[800px] py-4' : 'max-h-0 py-0'}`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-6">
                  {category.technologies.map((tech, techIndex) => (
                    <TranslucentTab 
                      key={techIndex}
                      content={tech.name} 
                      icon={tech.icon} 
                      link={tech.link} 
                      size="px-4 py-3 border col-span-1" 
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className='flex justify-center mt-7 cursor-pointer' onClick={(e) => handleScroll('projects', e)}>
          <CustomButton content={"Built with These Technologies"} variant={"blue"} size={"xl"} />
        </div>
      </div>
    </div>
  );
};

export default TechStack;
