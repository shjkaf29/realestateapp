import './list.scss'

import { useEffect, useState } from "react";

import Card from"../card/Card"
import apiRequest from "../../lib/apiRequest";

function List({posts}){
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Always fetch all posts for fallback
    if (allPosts.length === 0) {
      setLoading(true);
      apiRequest.get("/posts")
        .then(res => {
          setAllPosts(res.data);
          setLoading(false);
        })
        .catch(() => {
          setAllPosts([]);
          setLoading(false);
        });
    }
  }, [allPosts.length]);

  // If we have search results, show them
  if (posts && posts.length > 0) {
    return (
      <div className='list'>
        {posts.map(item => (
          <Card key={item.id} item={item}/>
        ))}
      </div>
    );
  }

  // If no search results but we have all posts (for fallback)
  if (posts && posts.length === 0 && allPosts.length > 0) {
    return (
      <div className='list'>
        <div className="no-results" style={{padding: 40, textAlign: 'center', color: 'gray'}}>
          No similar matches. Browse our other listings:
        </div>
        {allPosts.map(item => (
          <Card key={item.id} item={item}/>
        ))}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className='list'>
        <div style={{padding: 40, textAlign: 'center', color: 'gray'}}>
          Loading...
        </div>
      </div>
    );
  }

  // No posts at all
  return (
    <div className='list'>
      <div style={{padding: 40, textAlign: 'center', color: 'gray'}}>
        No posts available.
      </div>
    </div>
  );
}

export default List