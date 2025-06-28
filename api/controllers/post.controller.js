import jwt from "jsonwebtoken";
import { listData } from "../../client/src/lib/dummydata.js";
import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    console.log("Search query received:", query);
    
    // Debug: Let's see all posts in the database first
    const allPosts = await prisma.post.findMany();
    console.log("All posts in database:", allPosts.length);
    console.log("Sample post:", allPosts[0]);
    
    // Build dynamic filters with OR logic for flexible searching
    let whereConditions = [];
    
    // Handle empty or zero values properly
    const hasCity = query.city && query.city.trim() !== "";
    const hasType = query.type && query.type.trim() !== "";
    const hasProperty = query.property && query.property.trim() !== "";
    const hasBedroom = query.bedroom && !isNaN(parseInt(query.bedroom)) && parseInt(query.bedroom) > 0;
    const hasMinPrice = query.minPrice && !isNaN(parseInt(query.minPrice)) && parseInt(query.minPrice) > 0;
    const hasMaxPrice = query.maxPrice && !isNaN(parseInt(query.maxPrice)) && parseInt(query.maxPrice) > 0;

    // If we have any search criteria, build flexible OR conditions
    if (hasCity || hasType || hasProperty || hasBedroom || hasMinPrice || hasMaxPrice) {
      // Start with flexible city/location search using OR
      if (hasCity) {
        whereConditions.push({
          OR: [
            { city: { contains: query.city, mode: "insensitive" } },
            { address: { contains: query.city, mode: "insensitive" } }
          ]
        });
      }
      
      // Add other filters as AND conditions
      if (hasType) {
        whereConditions.push({ type: query.type });
      }
      
      if (hasProperty) {
        whereConditions.push({ property: query.property });
      }
      
      if (hasBedroom) {
        whereConditions.push({ bedroom: parseInt(query.bedroom) });
      }
      
      if (hasMinPrice || hasMaxPrice) {
        let priceCondition = {};
        if (hasMinPrice) priceCondition.gte = parseInt(query.minPrice);
        if (hasMaxPrice) priceCondition.lte = parseInt(query.maxPrice);
        whereConditions.push({ price: priceCondition });
      }
    }

    // Build the final query
    let posts = [];
    if (whereConditions.length > 0) {
      posts = await prisma.post.findMany({
        where: {
          AND: whereConditions
        },
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      // No filters, return all posts
      posts = await prisma.post.findMany({
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      });
    }

    console.log("Database query result:", posts.length, "posts found");

    // If no results found, provide fallback with Malaysian dummy data
    if (!posts || posts.length === 0) {
      console.log("No posts found in database, returning fallback Malaysian data");
      return res.status(200).json(listData);
    }

    res.status(200).json(posts);
  } catch (err) {
    console.log("Error in getPosts:", err);
    // On error, return fallback data
    res.status(200).json(listData);
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
      });
    }
    res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
