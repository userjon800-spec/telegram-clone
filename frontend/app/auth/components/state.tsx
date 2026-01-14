'use client'

// import { useAuth } from '@/hooks/use-auth'
import SignIn from './sign-in'
import Verify from './verify'

const StateAuth = () => {
  let step:any = 'login'
  return <>
			{step === 'login' && <SignIn />}
			{step === 'verify' && <Verify />}
		</>
};

export default StateAuth;
