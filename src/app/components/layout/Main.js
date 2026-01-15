import React from 'react'
import {Education,Skills,ProjectsCarousel,WorkExperience,ContactSection} from '../../components';

const Main = () => {
  return (
    <div  className='w-full md:mt-96 mt-[700px] '>
        <Education/>
        <WorkExperience/>
        <Skills/>
        <ProjectsCarousel/>
        <ContactSection/>
    </div>
  )
}

export default Main