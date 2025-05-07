import { useState } from 'react';
import contentBuilder from '../assets/content-builder.png';
import ghIcon from '../assets/github.svg';
import listify from '../assets/listify.png';
import mentorHub from '../assets/mentorHub.png';
import open from '../assets/open-link.svg';
import restaura from '../assets/restaura.png';
import thundermailPythonSDK from '../assets/thundermail-python-sdk.png';
import webIcon from '../assets/web.svg';
import workInProgress from '../assets/work-in-progress.png';
import zeniski from '../assets/zeniski.png';
import pixinary from '../assets/pixinary.png';
import devcodejourney from '../assets/devcodejourney.png';

const ProjectsSection = () => {
    const [tooltip, setTooltip] = useState({
        visible: false,
        content: '',
        x: 0,
        y: 0,
    });

    const projects = [
        {
            name: 'Pixinary',
            image: pixinary,
            github: 'https://github.com/shubhojit-mitra-dev/pixinary',
            link: 'https://pixinary.vercel.app/',
            description:
                'Pixinary is an image gallery that allows user to upload images on cloudinary, add any images to favorites, and edit images by turning them to grayscale, pixilate, blur or remove background. It is built using Next.js, TypeScript, Tailwind CSS, and Cloudinary file storage.',
        },
        {
            name: 'DevCodeJourney',
            image: devcodejourney,
            github: 'https://github.com/shubhojit-mitra-dev/blog-app/',
            link: 'https://dev-code-journey.vercel.app/',
            description:
                'My blogging platform built with Next.js, TypeScript, and Tailwind CSS. It features a user-friendly interface for creating, editing, and deleting blog posts, along with a robust backend powered by Node.js and Express.',
        },
        {
            name: 'Content Builder for Social Media',
            image: contentBuilder,
            github: 'https://github.com/shubhojit-mitra-dev/cbs',
            link: 'https://content-builder-for-social-media.vercel.app/',
            description:
                'Built a content builder app using Next.js and TypeScript to create and manage rich content efficiently, featuring Radix UI, TailwindCSS, Auth0 authentication, and React Query for state management.',
        },
        {
            name: 'Four Seasons Restaura',
            image: restaura,
            github: 'https://github.com/shubhojit-mitra-dev/restaura/',
            link: 'https://four-seasons-restaura.vercel.app/',
            description:
                'Developed a dynamic React frontend with TailwindCSS for a fast, responsive, and visually appealing UI. Implemented interactive features like a menu and contact section, enhancing user engagement, navigation, and overall experience across devices.',
        },
        {
            name: 'Listify',
            image: listify,
            github: 'https://github.com/shubhojit-mitra-dev/crud-project',
            link: 'https://listify.vercel.app/',
            description:
                'This full-stack web application, it allows users to manage lists (Create, Read, Update, Delete) using Next.js and MongoDB.  It was developed for a DBMS lab project, showcasing database management skills. ',
        },
        {
            name: 'Zeniski',
            image: zeniski,
            github: 'https://github.com/shubhojit-mitra-dev/zeniski',
            description:
                "An AI-powered task management application built with a robust Next.js, Tailwind CSS, and TypeScript tech stack. It features a user-friendly dashboard for seamless task creation and organization, enhanced by Gemini-powered AI that automatically generates optimized roadmaps for each task. Secure user authentication is handled by Clerk, while MongoDB ensures reliable and scalable data storage, offering users a comprehensive and efficient solution for managing their tasks"
        },
        {
            name: 'Thundermail Python SDK',
            image: thundermailPythonSDK,
            github: 'https://github.com/shubhojit-mitra-dev/thundermail-python-sdk',
            link: 'https://pypi.org/project/thundermail/',
            description:
                'Developed a Python SDK for Thundermail API with robust error handling, clean OOP design, and pip installation to streamline email integration for developers.',
        },
        {
            name: 'Mentor Hub',
            image: mentorHub,
            github: 'https://github.com/shubhojit-mitra-dev/Frontend',
            description:
                "A hackathon frontend project built with Next.js, TypeScript, and Tailwind CSS, designed to connect mentors and entrepreneurs. Offers a seamless user experience for professional networking and mentorship.",
        },
    ];

    const handleMouseEnter = (description) => {
        setTooltip((prev) => ({ ...prev, visible: true, content: description }));
    };

    const handleMouseMove = (e) => {
        setTooltip((prev) => ({
            ...prev,
            x: e.clientX + 20,
            y: e.clientY + 20,
        }));
    };

    const handleMouseLeave = () => {
        setTooltip((prev) => ({ ...prev, visible: false, content: '' }));
    };

    return (
        <>
            <div
                className="relative grid justify-center items-center p-4 sm:mb-0"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-75"></div>
                <div className="relative text-center w-full">
                    <h1 className="text-white text-3xl sm:text-5xl font-bold mb-12 mt-20 sm:mt-0">
                        🚀 Projects
                    </h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:m-20">
                        {projects.map((project, index) => (
                            <div
                                key={index}
                                className="translucent transition-transform duration-300 hover:scale-105 p-4 rounded-lg shadow-lg flex flex-col items-center"
                                onMouseEnter={() => handleMouseEnter(project.description)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img
                                    src={project.image ?? workInProgress}
                                    alt={project.name}
                                    className="rounded-lg w-full object-cover"
                                />
                                <h2 className="text-white text-xl font-bold mt-4">{project.name}</h2>
                                <a
                                    href={project.link || project.github || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white font-bold mt-2 bg-black px-4 py-2 rounded-lg flex items-center"
                                    onClick={(e) => {
                                        if (!project.link && !project.github) e.preventDefault();
                                    }}
                                >
                                    {project.link ?
                                    <img
                                        src={webIcon}
                                        className='w-5 h-5 mr-2'
                                        style={{ filter: 'brightness(0) invert(1)' }}
                                        alt=""
                                    />
                                    : project.github ? <img src={ghIcon} className='w-5 h-5 mr-2' alt="" /> : null}
                                    {project.link
                                        ? 'View Project'
                                        : project.github
                                            ? 'View on GitHub'
                                            : 'Work in Progress'
                                    }
                                    <img src={open} className='w-5 h-5 ml-2' alt="" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                {tooltip.visible && (
                    <div
                        className="fixed translucent text-white p-3 rounded-lg shadow-lg max-w-xs z-50"
                        style={{ top: tooltip.y, left: tooltip.x }}
                    >
                        {tooltip.content}
                    </div>
                )}
            </div>
        </>
    );
};

export default ProjectsSection;
