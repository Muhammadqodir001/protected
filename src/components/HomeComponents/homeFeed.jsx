import React, { useRef, useEffect, useState } from 'react';
import { GoComment } from "react-icons/go";
import { FiBarChart2 } from "react-icons/fi";
import { TbHeartShare } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { IoPersonCircleSharp } from "react-icons/io5";
import Explore from '../sideBarPages/explore';
import { FaCompass } from 'react-icons/fa';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { HashLoader, PulseLoader } from 'react-spinners';
import { useAuthState } from 'react-firebase-hooks/auth';
import{ auth, db } from '../../firebase'
import { ImHeart } from "react-icons/im";
import { FiHeart } from "react-icons/fi";
import { useUserData } from '../../getUserData';
import { BsThreeDots } from "react-icons/bs";

const ImageCard = ({ user, post }) => {
  const [authenticatedUser] = useAuthState(auth);
  const videoRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { allUsersData } = useUserData();
  const commentsEndRef = useRef(null);
  const isPostDisabled = commentText.trim().length === 0;

  // Handle Like
  const handleLike = async (event, likedPost, likedUser) => {
    if (event) {
      event.preventDefault();
    }

    if (!likedUser || !likedPost) {
      console.error("Liked user or liked post not found");
      return;
    }
  
    if (!likedPost.likes) {
      likedPost.likes = []; 
    }
  
    try {
      if (authenticatedUser && authenticatedUser?.uid) {
        if (likedPost?.likes.includes(authenticatedUser.uid)) {
          likedPost.likes = likedPost?.likes.filter((uid) => uid !== authenticatedUser.uid);
        } else {
          likedPost.likes.push(authenticatedUser.uid);
        }
  
        const userRef = doc(db, "users", likedUser?.uid);
        const updatedData = {
          posts: likedUser.posts
        };
  
        await updateDoc(userRef, updatedData);
        console.log('Document updated successfully');
      } else {
        console.error("User authentication failed.");
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };


  //  Handle Comment
  const handleComment = async (event, likedPost, likedUser) => {
    if (event) {
      event.preventDefault();
    }
    setIsCommenting(true)

    try {
      if (authenticatedUser && authenticatedUser.uid) {
        const newComment = {
            userId: authenticatedUser.uid,
            text: event.target.comment.value,
            timestamp: new Date().toISOString()
        };
        likedPost.comments.push(newComment);
        const userRef = doc(db, "users", likedUser?.uid);
        const updatedData = {
          posts: likedUser.posts
        };
        await updateDoc(userRef, updatedData);
        setIsCommenting(false)
        setCommentText('')
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    } else {
        console.error("User authentication failed.");
    }
    }catch (error) {
      console.error('Error adding comment:', error);
    } 
  };

  // Scroll to the bottom when comments load or change
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [post.comments]);

  const formatTimestamp = (timestamp) => {
    const timeDiff = new Date() - new Date(timestamp);
    const seconds = Math.floor(timeDiff / 1000);
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hours ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
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
    <div className='w-full  p-4 border-t borderBg mb-2'>
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
        <div className="flex flex-col p-2">
            <h2>{post.caption}</h2>
            <p className="text-sm text-gray-500">{post.hashtag}</p>
         </div>
      </div>
      <div className='flex flex-col p-2 gap-5'>
      <div className='flex justify-center items-center'>
      <div className='flex w-full max-w-[500px] max-h-[600px] border borderBg px-2 rounded-md'>
      {post.type === 'image' ? (
        
        <img
          src={post.media}
          className="object-cover aspect-square w-full h-full"
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
          <div className='flex items-center justify-center space-x-1' onClick={() => setShowCommentForm(prev => !prev)}>
            <GoComment size={20} className='text-[#0b17ff] cursor-pointer' />
            <span className='text-xs text-gray-600'>{post?.comments?.length}</span>
         </div>

          <div className='flex items-center justify-center space-x-1' onClick={(event) => {
              handleLike(event, post, user);
              setIsAnimating(true);
          }}>
            <div className={post.likes.includes(authenticatedUser?.uid) ? (isAnimating ? 'heart-beat cursor-pointer flex text-[#ff0404] rounded-full justify-center items-center' : 'cursor-pointer rounded-full text-[#ff0404]') : 'cursor-pointer rounded-full'}>
                {post.likes.includes(authenticatedUser?.uid) ?
                    <ImHeart size={20} />
                    : <FiHeart size={20} />
                }
            </div>
            <span className='text-xs text-gray-600'>
                {post.likes.length}
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

      {/* Add Comment */}
       <div className='flex flex-col w-full h-full justify-center items-center mt-2 overflow-hidden'>
         {showCommentForm && (
            <div className="flex justify-center items-center w-full h-full max-h-[400px] flex-col max-w-[500px] p-4 bg-black">
              <div className="h-full w-full justify-start items-start max-h-[350px] overflow-y-auto">
                <div className='flex flex-col w-full'>
                  {post.comments.map((comment) => {
                    const commenter = allUsersData?.find((u) => u.uid === comment.userId);
                    
                    return (
                      <div key={comment.timestamp} className="flex w-full  items-start py-3 gap-3">
                        {commenter?.userPictureURL?
                          <img className='h-12 w-12 rounded-full border-2' src={commenter?.userPictureURL} alt='' />
                        : <div className='rounded-full bg-gray-300 flex items-center justify-center'><IoPersonCircleSharp size={50}/></div>
                        } 
                       
                        <div className='flex justify-start flex-col'>
                          <div className='flex items-center gap-2'>
                            <p className="text-white font-bold">{commenter?.fullName}</p>
                            <p className="text-gray-400 text-xs">{formatTimestamp(comment.timestamp)}</p>
                          { comment.userId === commenter.uid && <p className="text-gray-400 text-xs"><BsThreeDots /></p>}
                          </div>
                          <p className="text-gray-100 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                 <div ref={commentsEndRef} /> 
              </div>
            </div>
           )}

         { showCommentForm && <form
          className='flex border-b bg-black borderBg w-full max-w-[500px] h-full max-h-[60px] items-center'
          onSubmit={(event) => handleComment(event, post, user)}
        >
          <input
            name="comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-transparent h-10 px-2 outline-none"
            placeholder="Add a comment..."
            autoComplete='off'
          />
          <button
            type="submit"
            className={`px-4 py-2 w-[80px] h-[40px] ${isPostDisabled ? 'text-gray-500' : 'text-green-500'}`}
            disabled={isPostDisabled}
          >
            {isCommenting ? (
              <div className="flex items-center justify-center">
                <PulseLoader color='#F9008E' size={15} loading={true} />
              </div>
            ) : (
              "Post"
            )}
          </button>
        </form> }
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
    
      {!display ? 
        <div className='w-full h-full overflow-y-auto'>
          {allPosts.length !== 0 ? (
            <>
              {allPosts.map((postWithUser, index) => (
                <ImageCard key={index} user={postWithUser.user} post={postWithUser.post} />
              ))}
            </>
          ) : (
            <div className='flex justify-center items-center w-full h-full'>
              <HashLoader color='#F9008E' size={200} loading={true} /> 
            </div>
          )}
        </div> 
        : (
          <div className='flex w-full overflow-y-auto'>
            <Explore />
          </div>
        )
      }
    </main>
    
    );

 
};

export default HomeFeed;











