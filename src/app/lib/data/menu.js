import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaLinkedinIn } from "react-icons/fa6";
import { SiRefinedgithub } from "react-icons/si";


import { BiLogoGmail } from "react-icons/bi";


export const menu = [
    { name: 'Home', route: '#home' },
    { name: 'About', route: '#about' },
    { name: 'Education', route: '#education' },
    { name: 'Experience', route: '#experience' },
    { name: 'Projects', route: '#projects' },
    { name: 'Skills', route: '#skills' },
    { name: 'Contact', route: '#contact' },
];


export const socialMenu = [
    {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/vishal-kumar-choudhary-664921229/',
    target: '_blank',
    icon: FaLinkedinIn,
    brandColor:'group-hover:text-[#0293ce]',
    activeColor:'active:text-[#0293ce]'

  },
  {
    name: 'Gmail',
    url: 'https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSGLdbRHqRFgLCBMCfdWmBSgSrmxGRxtFjSdnGMLLSngNCpHkbvRPlcZgwPRPpLvZhxpxJWV',
    target: '_blank', 
    icon: BiLogoGmail,
    brandColor:'group-hover:text-[#c71f10]',
    activeColor:'active:text-[#c71f10]'

  },
  {
    name: 'GitHub',
    url: 'https://github.com/VishalChoudhary01',
    target: '_blank',
    icon: SiRefinedgithub,
    brandColor:'group-hover:text-[#39b80b]',
    activeColor:'active:text-[#39b80b]'
  },
  
  
];