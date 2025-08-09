import React, { createContext, useEffect, useState } from 'react'
export const userDataContext = createContext()
import axios from "axios"

function UserContext({children}) {
    const serverUrl = "https://virtual-assistant-backend-r1h0.onrender.com"
    const [userData, setUserData] = useState(null)
    const [frontedImage, setFrontendImage]=useState(null)
    const [backendImage, setBackendImage]=useState(null)
    const [selectedImage, setSelectedImage]=useState(null)

    const handleCurrentUser = async ()=>{
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
        setUserData(result.data)
        console.log(result.data)
      } catch (error) {
        console.log(error)
      }
    }

    const getGeminiResponse =async(command)=>{
      try {
        const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, 
        {command},{withCredentials:true})
        return result.data

      } catch (error) {
        console.log(error)
      }
    }

    useEffect(()=>{
      handleCurrentUser()
    },[])
    const value = {
        serverUrl, userData, setUserData,backendImage, setBackendImage, frontedImage, setFrontendImage, selectedImage, setSelectedImage, getGeminiResponse
    }

  return (
    <div>
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
        
    </div>   
  )
}

export default UserContext ;
