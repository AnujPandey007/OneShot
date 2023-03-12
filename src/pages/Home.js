import React from 'react';
// import backgroundImage from "../assets/1.jpg";
import { useNavigate, Link } from 'react-router-dom';

export default function Home({isAuth}) {
  let navigate = useNavigate();

  const [blogs, setBlogs] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if(!isAuth){
      navigate('/login');
    }
    const getBlogs = async()=>{
      let blogApi = `http://localhost:3000/blog/getBlogs`;
      let blogsData = await fetch(blogApi);
      let jsonBlogsData = await blogsData.json();
      setBlogs(jsonBlogsData);
      setIsLoading(false)
    }
    getBlogs();

  }, [isAuth, navigate]);

  function addBlog() {
    try {
      navigate("/addpost");
    } catch(e) {
      console.log(e);
    }
  }


  if(isLoading){
    return ( 
      <div className="flex items-center justify-center h-screen">
        <div role="status">
            <svg aria-hidden="true" className="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={addBlog} title="Add Blog" className="fixed z-90 bottom-10 right-8 bg-black w-14 h-14 rounded-full drop-shadow-lg flex justify-center items-center text-white text-s">
        &#65291;
      </button>
      
      {blogs.length!==0 &&  <section className="pt-10 pb-10 lg:pt-[10px] lg:pb-20">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[510px] text-center lg:mb-20">
                <span className="text-primary mb-2 block text-lg font-semibold">
                  ONESHOT
                </span>
                <h2
                  className="text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]"
                >
                  Our Recent Blogs
                </h2>
                <p className="text-body-color text-base">
                  There are many kinds of blogs including sports, food, travel, lifestyle, fashion, photography and science.
                </p>
              </div>
            </div>
          </div>
          <div className="-mx-4 flex flex-wrap">
            {blogs.map((doc)=> {
              return (<div key={doc._id} className="w-full px-4 md:w-1/2 lg:w-1/3">
              <Link to={`/getpost/${doc._id}`}>
                  <div className="mx-auto mb-10 max-w-[370px]">
                    <div className="mb-8 overflow-hidden rounded w-96 h-60">
                      <img
                        src={doc.blogImage}
                        alt={doc._id}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className='flex flex-row items-end place-content-between	mb-4'>
                        <div className='flex flex-row items-center'>
                            <div className="w-6 h-6 mr-1">
                              <img src={doc.userImage} alt={doc.userId} className="shadow-lg rounded max-w-full h-auto align-middle border-none"/>
                            </div>
                            <div className="font-bold md:flex text-sm">
                                {doc.userName}
                            </div>
                        </div>
                        <span className="bg-primary inline-block rounded px-4 text-center text-xs font-semibold leading-loose text-black">
                          {new Date(doc.blogTime).toLocaleString()}
                        </span>
                      </div>
                      <h3>
                        <div className="text-dark hover:text-primary mb-4 inline-block text-xl font-semibold sm:text-2xl lg:text-xl xl:text-2xl">
                          {doc.blogTitle}
                        </div>
                      </h3>
                      <p className="text-body-color text-base">
                        {doc.blogText.substr(0, 200) + "...."}
                      </p>
                    </div>
                  </div>
                {/* </div> */}
              </Link>
            </div>);
            })}
          </div>
        </div>
      </section>}

      <div className='flex flex-col items-center w-full h-full justify-center self-center'>
        {blogs.length===0 && <div className="h2 text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">Blogs are not Available</div>}
      </div>

    </>
  );
}
