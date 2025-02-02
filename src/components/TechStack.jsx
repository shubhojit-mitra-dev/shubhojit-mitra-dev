import React from 'react';
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

const TechStack = () => {

  const handleScroll = (id, event) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='relative flex justify-center items-center p-4 sm:mb-0' style={{ height: 'calc(100vh + 4rem)' }}>
      <div className='absolute top-0 left-0 w-full h-full bg-black opacity-75'></div>
      <div className='relative text-center'>
        <h1 className='text-white text-3xl sm:text-5xl font-bold mb-12 mt-0 sm:mt-0'>👨‍💻 Tech Stack</h1>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-2'>
          <TranslucentTab content="HTML" icon={htmlIcon} link="https://developer.mozilla.org/en-US/docs/Web/HTML" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="CSS" icon={cssIcon} link="https://developer.mozilla.org/en-US/docs/Web/CSS" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="JavaScript" icon={jsIcon} link="https://developer.mozilla.org/en-US/docs/Web/JavaScript" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Python" icon={pyIcon} link="https://www.python.org/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Next.js" icon={nextIcon} link="https://nextjs.org/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="React" icon={reactIcon} link="https://reactjs.org/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Tailwind CSS" icon={twIcon} link="https://tailwindcss.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="TypeScript" icon={tsIcon} link="https://www.typescriptlang.org/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Shadcn" icon={shadcnIcon} link="https://ui.shadcn.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Git" icon={gitIcon} link="https://git-scm.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="GitHub" icon={ghIcon} link="https://www.github.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Node.js" icon={nodeIcon} link="https://nodejs.org/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Postman" icon={postmanIcon} link="https://www.postman.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="Figma" icon={figmaIcon} link="https://www.figma.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="MongoDB" icon={mongoIcon} link="https://www.mongodb.com/" size="px-10 py-5 border col-span-1" />
          <TranslucentTab content="C++" icon={cppIcon} link="https://isocpp.org/" size="px-10 py-5 border col-span-1" />
        </div>
        <div className='flex justify-center mt-7 cursor-pointer' onClick={(e) => handleScroll('projects', e)}>
            <CustomButton content={"Built with These Technologies"} variant={"blue"} size={"xl"} />
        </div>
      </div>
    </div>
  );
};

export default TechStack;
