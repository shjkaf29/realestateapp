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
                if (!postResponse || !Array.isArray(postResponse.data)) {
                  return <p>Error loading posts!</p>;
                }
                if (postResponse.data.length === 0) {
                  return <p>No results found for your search.</p>;
                }
                return postResponse.data.map((post) => (
                  <Card key={post.id} item={post} />
                ));
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
            {(postResponse) => <Map items={Array.isArray(postResponse.data) ? postResponse.data : []} />}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export default ListPage;
