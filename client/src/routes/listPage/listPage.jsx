import "./listPage.scss";

import { Await, useLoaderData } from "react-router-dom";

import Card from "../../components/card/Card";
import Filter from "../../components/filter/Filter";
import Map from "../../components/map/Map";
import { Suspense } from "react";

function ListPage() {
  const data = useLoaderData();

  return (
    <div className="listPage">
      <div className="listContainer">
        <div className="wrapper">
          <Filter />
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => {
                console.log("Post response:", postResponse);
                
                // Handle the new response format with fallback
                const posts = postResponse.data || postResponse;
                const isFallback = postResponse.fallback;
                const message = postResponse.message;
                
                if (!Array.isArray(posts)) {
                  return <p>Error loading posts!</p>;
                }
                
                if (posts.length === 0) {
                  return <p>No results found for your search.</p>;
                }
                
                return (
                  <>
                    {isFallback && message && (
                      <div style={{ 
                        padding: "10px", 
                        backgroundColor: "#f0f8ff", 
                        border: "1px solid #ccc", 
                        borderRadius: "5px", 
                        marginBottom: "20px" 
                      }}>
                        <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
                          {message}
                        </p>
                      </div>
                    )}
                    {posts.map((post) => (
                      <Card key={post.id} item={post} />
                    ))}
                  </>
                );
              }}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="mapContainer">
        <Suspense fallback={<p>Loading...</p>}>
          <Await
            resolve={data.postResponse}
            errorElement={<p>Error loading posts!</p>}
          >
            {(postResponse) => {
              const posts = postResponse.data || postResponse;
              return <Map items={Array.isArray(posts) ? posts : []} />;
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export default ListPage;
