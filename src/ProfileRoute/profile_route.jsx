import React from 'react'
import SideBar from '../components/sideBar'
import Profile from '../components/profile'
import ProfileAccounts from '../components/profileAccounts'
import BottomBar from '../components/bottomBar'

const Profiles = () => {
  return (
    <main className='flex gap- flex-row justify-center w-full h-screen overflow-hidden'>
    <div className='sideBarResize lg:w-[30%]'>
      <SideBar />
    </div>
    <div className='lg:w-2/4 max-w-[650px] borderBg border-l border-r w-full overflow-y-auto'>
     <Profile />
    </div>
    <div className='lg:w-[30%] hidden lg:flex '>
      <ProfileAccounts />
    </div>
    <BottomBar />
  </main>
  )
}

export default Profiles