import React, { useRef, useEffect, useState } from 'react';
import { GoComment } from "react-icons/go";
import { FaRegHeart } from "react-icons/fa";
import { FiBarChart2 } from "react-icons/fi";
import { TbHeartShare } from "react-icons/tb";
import { useUserData } from '../../getUserData'; 
import { Link } from 'react-router-dom';
import { IoPersonCircleSharp } from "react-icons/io5";
import Explore from '../sideBarPages/explore';
import { FaCompass } from 'react-icons/fa';
import { onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { collection } from 'firebase/firestore';

const ImageCard = ({ user, post }) => {
  const [liked, setLiked] = useState(false);
  const videoRef = useRef(null);

  
 
  const handleLike = () => {
    setLiked(!liked);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play();
            entry.target.muted = true; 
          } else {
            entry.target.pause();
            entry.target.muted = true;
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <div className='w-full p-4 border-t borderBg mb-2'>
      <div className='flex items-center '>
        <Link to={`/${user?.userName}`}>
        { user?.userPictureURL?
          <img className='h-12 w-12 rounded-full border-2' src={user?.userPictureURL} alt='' />
        : <div className='rounded-full bg-gray-300 flex items-center justify-center'><IoPersonCircleSharp size={50}/></div>
        } 
        </Link>
        <div className='ml-2 flex gap-2 items-center'>
            <Link to={`/${user?.userName}`}>
              <h1 className='font-bold text-xl'>{user?.fullName}</h1>
              <h2 className='text-gray-500 text-sm'>@{user?.userName}</h2>
            </Link>
        </div>
      </div>
      <div className='flex mt-2 ml-2 justify-start max-w-[550px] overflow-hidden'>
        <p className='flex'>
          {post.caption} 
        </p>
      </div>
      <div className='flex flex-col p-2 gap-7'>
      <div className='flex justify-center items-center'>
      <div className='flex w-full max-w-[500px] max-h-[600px] border borderBg p-2 rounded-[10px]'>
      {post.type === 'image' ? (
        <img
          src={post.media}
          className="object-cover aspect-square w-full h-full"
          alt="Posted image"
        />
       ) : post.type === 'video' ? (
        <video
          ref={videoRef}
          className=" w-full h-full max-w-[500px] max-h-[570px]"
          autoPlay
          loop
          muted
          controls
        >
          <source src={post.media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : ''}
    </div>
        </div>
        <div className='flex justify-around'>
          <div className='flex items-center justify-center space-x-1'>
            <GoComment size={20} className='curtext-gray-600 cursor-pointer' />
            <span className='text-xs text-gray-600'>{post.comments.length} Comments</span>
          </div>
    
          <div className='flex items-center justify-center space-x-1' onClick={handleLike}>
           <FaRegHeart size={20} className={liked ? 'text-red-500 cursor-pointer' : 'text-gray-600 cursor-pointer'} />
           <span className='text-xs  text-gray-600'>{liked ? (post.likes)+1
              : (
              (post.likes+0)
              )}
            </span>
         </div>

          <div className='flex items-center justify-center space-x-1'>
            <FiBarChart2 size={20} className='cursor-pointer text-blue-500' />
            <span className='text-xs text-gray-600'>{post.impressions}</span>
          </div>

          <div className='flex items-center justify-center space-x-1 '>
            <TbHeartShare size={20} className='cursor-pointer text-purple-500' />
            <span className='text-xs text-gray-600'>{post.shares}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

  
const HomeFeed = () => {
  const [display, setDisplay] = useState(false);
  const [activeTab, setActiveTab] = useState('ForYou');
  const [allPosts, setAllPosts] = useState([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
      const updatedPosts = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.posts && Array.isArray(user.posts)) {
          user.posts.forEach((post) => {
            const postWithUser = {
              user: user,
              post: post
            };
            updatedPosts.push(postWithUser);
          });
        }
      });
      updatedPosts.sort((a, b) => new Date(b.post.timestamp) - new Date(a.post.timestamp));
      setAllPosts(updatedPosts);
    });
  
    return () => unsubscribe();
  }, []);

    return (
    <main className='flex flex-col items-center w-full h-full'>
      <div className='flex w-full items-center justify-between border-b borderBg'>
      <div
        onClick={() => {
          setDisplay(false);
          setActiveTab('ForYou');
        }}
        className={`flex md:hover:bg-[#464749] cursor-pointer justify-center items-center w-full h-14 ${activeTab === 'ForYou' ? 'active-tab' : ''}`}>
        <h1>Featured</h1>
      </div>
      <div
        onClick={() => {
          setDisplay(true);
          setActiveTab('Explore');
        }}
        className={`flex md:hover:bg-[#464749] cursor-pointer justify-center gap-2 items-center w-full h-14 ${activeTab === 'Explore' ? 'active-tab' : ''}`}>
        <FaCompass size={25} />
        <h1>Explore</h1>
      </div>
    </div>

      {!display? <div className='w-full h-full overflow-y-auto'>
          {allPosts.map((postWithUser, index) => {
            return (
              <ImageCard key={index} user={postWithUser.user} post={postWithUser.post} />
            );
          })}
        </div> :(
          <div className='flex w-full overflow-y-auto'>
            <Explore />
          </div>
        )}
      </main>
    );

 
};

export default HomeFeed;











