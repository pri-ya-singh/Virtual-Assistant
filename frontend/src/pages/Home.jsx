import React, { useContext, useEffect, useState, useRef } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiMenu } from 'react-icons/hi';
import { RxCross1 } from 'react-icons/rx';
import aiImg from '../assets/ai.gif';
import userImg from '../assets/user.gif';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const [ham, setHam] = useState(false);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate('/signin');
    } catch (error) {
      console.log(error);
    }
  };

  const startRecognition = () => {
    if(!isSpeakingRef.current && !isRecognizingRef.current){
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error('Recognition error: ', error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText('');
      isSpeakingRef.current = false;
      setTimeout(() =>{
        startRecognition();
      },800);
    };
    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === 'google_search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
    if (type === 'calculator_open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
    if (type === 'instagram_open') {
      window.open(`https://www.instagram.com`, '_blank');
    }
    if (type === 'facebook_open') {
      window.open(`https://www.facebook.com`, '_blank');
    }
    if (type === 'weather_show') {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }
    if (type === 'youtube_search' || type === 'youtube_play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    let isMounted = true;

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log('Recognition requested to start');
        } catch (err) {
          if (err.name !== 'InvalidStateError') {
            console.log('Start error: ', err);
          }
        }
      }
    }, 1000)

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if(isMounted && !isSpeakingRef.current){
        setTimeout(() =>{
          if(isMounted){
            try{
              recognition.start();
              console.log("recognition restarted");
            } catch (e){
              if(e.name !== "InvalidStateError"){
                console.error(e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Recognition error: ', event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== 'aborted' && isMounted &&!isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted){
            try{
              recognition.start();
              console.log("Recognition restarted after error")
            }catch(e){
              if(e.name !== "InvalidStateError"){
                console.error(e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (transcript.toLowerCase().includes(userData?.assistantName?.toLowerCase())) {
        setAiText('');
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText('');
      }
    };

      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
      window.speechSynthesis.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);    

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023c] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <HiMenu
        className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer'
        onClick={() => setHam(true)}
      />
      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-[#00000050] backdrop-blur-lg p-[20px] ${
          ham ? 'translate-x-0' : 'translate-x-full'
        } transition-transform`}
      >
        <RxCross1
          className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer'
          onClick={() => setHam(false)}
        />
        <button
          className='min-w-[150px] h-[60px] text-black mr-[20px] font-semibold text-[19px] bg-white rounded-full cursor-pointer'
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className='min-w-[150px] h-[60px] mt-[30px] mb-[20px] text-black font-semibold text-[19px] bg-white rounded-full cursor-pointer px-[20px] py-[10px]'
          onClick={() => navigate('/customize')}
        >
          Customize your Assistant
        </button>
        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px] mt-[10px] mb-[10px]'>History</h1>
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col'>
          {userData?.history ? (
            userData.history.map((his, idx) => (
              <span className='text-gray-200 text-[18px]' key={idx}>
                {his}
              </span>
            ))
          ) : (
            <span className='text-gray-200 text-[18px]'>No history available</span>
          )}
        </div>
      </div>
      <button
        className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold text-[19px] bg-white absolute hidden lg:block top-[20px] right-[20px] rounded-full cursor-pointer'
        onClick={handleLogOut}
      >
        Log Out
      </button>
      <button
        className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold text-[19px] bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer hidden lg:block px-[20px] py-[10px]'
        onClick={() => navigate('/customize')}
      >
        Customize your Assistant
      </button>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-2xl shadow-lg'>
        <img
          src={userData?.assistantImage}
          alt='Assistant avatar'
          className='h-full object-cover'
        />
      </div>
      <h1 className='text-white text-[30px] font-semibold'>
        I'm {userData?.assistantName || 'Assistant'}
      </h1>
      <img
        src={aiText ? aiImg : userImg}
        alt={aiText ? 'AI response avatar' : 'User avatar'}
        className='w-[200px]'
      />
      <h1 className='text-white text-[18px] font-semibold text-wrap'>
        {userText || aiText || 'Waiting for your command...'}
      </h1>
    </div>
  );
}

export default Home;