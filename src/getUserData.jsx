import { createContext, useContext } from 'react';
import { useState, useEffect } from 'react';
import { db, auth } from "./firebase";
import { query, where, getDocs, collection } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';

const UserDataContext = createContext();

const GetUserData = ({ children }) => {
  const [allUsersData, setAllUsersData] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [user, loading] = useAuthState(auth);
  

  useEffect(() =>{
    const fetchAllData = async () => {
      try{
        const querySnapshot = await getDocs(collection(db, "users")) 
        let AllUsersData = [];
        querySnapshot.forEach((doc) => {
            AllUsersData.push({ id: doc.id, ...doc.data() });
        });
        setAllUsersData(AllUsersData); 
      }catch(error){
         console.log(error)
      }
    };
    fetchAllData(); 
  }, [])


  console.log(allUsersData)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!loading && user) {
        setIsLoading(true);
        const uid = user.uid;
        const q = query(collection(db, "users"), where("uid", "==", uid));
        try {
          console.log("Fetching user profile...");
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            setUserProfile(null);
          } else {
            let userProfileData = [];
            querySnapshot.forEach((doc) => {
              userProfileData.push({ id: doc.id, ...doc.data() });
            });
            setUserProfile(userProfileData); 
          }
        } catch (error) {
          console.error("Error fetching user profile: ", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user, loading]);


  return (
    <UserDataContext.Provider value={{userProfile,allUsersData}}>
      {children}
    </UserDataContext.Provider>
  );
};

const useUserData = () => useContext(UserDataContext);
export { GetUserData, useUserData };

