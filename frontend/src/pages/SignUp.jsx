import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '../assets/authBg.webp';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const {serverUrl, userData, setUserData} = useContext(userDataContext) ;
  const navigate = useNavigate();
  const [name, setName] = useState("")
  const[email,setEmail] = useState("")
  const[loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const[err, setErr]=useState("")

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async (e) =>{
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, {
        name,email,password
      }, {withCredentials:true})
      setUserData(result.data)
      setLoading(false)
      navigate("/customize")
    } catch (error) {
      console.log(error)
      setUserData(null)
      setErr(error.response.data.message)
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center "
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className="w-[90%] h-[600px] max-w-[500px] bg-[#000000af] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]" 
      onSubmit={handleSignUp}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Register to <span className="text-blue-500">Virtual Assistant</span>
        </h1>

        <input
          type="text"
          placeholder="Enter your Name"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" required onChange={(e)=> setName(e.target.value)} value={name}
        />

        <input
          type="text"
          placeholder="Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" required onChange={(e)=> setEmail(e.target.value)} value={email}
        />

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px] text-white" required onChange={(e)=> setPassword(e.target.value)} value={password}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 text-white cursor-pointer"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {err.length>0 && <p className='text-red-500 text-[17px]'>
          *{err}
          </p>}

        <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold text-[19px] bg-white rounded-full cursor-pointer" disabled={loading}>
          {loading ? "Loading..." : "Sign Up"}
        </button>

        <p className="text-white text-[18px] mt-[20px]">
          Already have an account?{' '}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignUp;