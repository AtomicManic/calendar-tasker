import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {

 const handleSignIn = async () => {
   try {
     const response = await fetch('http://localhost:8081/auth',{
      credentials: 'include',
     });
     const { authUrl } = await response.json();
     
     window.location.href = authUrl;
   } catch (error) {
     console.error('Failed to authenticate:', error);
   }
 };

 return (
   <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
     <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow">
       <div className="text-center">
         <h1 className="text-3xl font-bold">Welcome to Calendar Tasker</h1>
         <p className="mt-4 text-gray-600">
           By signing in, you consent to us using your phone number for notifications
           about your calendar events and tasks.
         </p>
       </div>

       <button
         onClick={handleSignIn}
         className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
       >
         Sign in with Google
       </button>
     </div>
   </div>
 );
};

export default Login;