import React from 'react';
import { useMediaQuery } from 'react-responsive';
import downloadIcon from '../assets/download.svg';
import contactIcon from '../assets/contact.svg';
import CustomButton from './ui/CustomButton';
import githubIcon from '../assets/github.svg';
import linkedinIcon from '../assets/linkedin.svg';
import instaIcon from '../assets/instagram.svg';

const HeroSection = () => {
    const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });
    const HEADER = "Heyy 👋, I'm Shubhojit Mitra";
    const CONTENT = 'A full-stack developer who is motivated in JavaScript, React, Next.js, and TailwindCSS. Experience with responsive web application development, integration of AI, and database management using MongoDB. Applying my skills in Modern front-end development and UI/UX design to create innovative projects.';

    const resumeLink = 'https://drive.google.com/file/d/1SAaThb8fW_ZUrY9cg9GZyH0-G7OE5PlV/view?usp=sharing';

    const handleScroll = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className='relative flex justify-center items-center p-4' style={{ height: 'calc(100vh - 4rem)' }}>
                <div className='absolute top-0 left-0 w-full h-full bg-black opacity-75'></div>
                <div className='relative text-center'>
                    <div className="text-white font-bold tracking-wide text-2xl sm:text-5xl flex mb-10">
                        {[...HEADER].map((letter, index) => (
                            <span key={index} className='h-10 scale-hover-span'>
                                {letter === ' ' ? '\u00A0' : letter}
                            </span>
                        ))}
                    </div>
                    <div className='sm:max-w-2xl text-neutral-400 text-sm sm:text-xl flex flex-wrap justify-center text-center items-center mx-auto'>
                        {CONTENT.split(' ').map((word, wordIndex) => (
                            <div key={wordIndex} className="flex mr-1 scale-hover-span sm:hover:text-white">
                                {[...word].map((letter, letterIndex) => (
                                    <span
                                        key={`${wordIndex}-${letterIndex}`}
                                        className='h-7'
                                    >
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        ))} </div>
                    <div className='mt-10 flex flex-wrap justify-center space-y-0 space-x-5 sm:space-y-0 sm:space-x-10'>
                        <CustomButton content="Download CV" icon={downloadIcon} variant="blue" size={isSmallScreen ? 'm' : 'xl'} link={resumeLink} />
                        <CustomButton content="Contact Me" icon={contactIcon} variant="white" size={isSmallScreen ? 'm' : 'xl'} link="#contact" onClick={() => handleScroll('footer')} />
                    </div>
                    <div className='flex justify-center mt-10 gap-10'>
                        <a href="https://linkedin.com/in/shubhojit-mitra-dev" target="_blank" rel="noopener noreferrer">
                            <img src={linkedinIcon} alt="LinkedIn" className='w-12' />
                        </a>
                        <a href="https://github.com/shubhojit-mitra-dev" target="_blank" rel="noopener noreferrer">
                            <img src={githubIcon} alt="GitHub" className='w-12' />
                        </a>
                        <a href="https://instagram.com/shubhojit-mitra-dev" target="_blank" rel="noopener noreferrer">
                            <img src={instaIcon} alt="Instagram" className='w-12' />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HeroSection;
