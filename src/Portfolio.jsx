// import React from 'react';
import './App.css';
import videoBg from './assets/videoBg.mp4';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import NavBar from './components/NavBar';
import ProjectsSection from './components/ProjectsSection';
import TechStack from './components/TechStack';


const App = () => {
  return (
    <>
      <NavBar />
      <video id="background-video" src={videoBg} autoPlay loop muted />
      <div id="hero">
        <HeroSection />
      </div>
      <div id="about">
        <AboutSection />
      </div>
      <div id="tech-stack">
        <TechStack />
      </div>
      <div id="projects">
        <ProjectsSection />
      </div>
      <div id="footer">
        <Footer />
      </div>
    </>
  );
};

export default App;
