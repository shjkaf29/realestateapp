import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
  const query = req.query;

  // Helper to ignore empty, 'any', or undefined
  const filterValue = (val) => {
    if (val === undefined || val === null || val === '' || val === 'any') return undefined;
    return val;
  };

  // Sorting logic
  let orderBy = undefined;
  if (query.sort) {
    if (query.sort === 'price_asc') orderBy = { price: 'asc' };
    else if (query.sort === 'price_desc') orderBy = { price: 'desc' };
    else if (query.sort === 'date_asc') orderBy = { createdAt: 'asc' };
    else if (query.sort === 'date_desc') orderBy = { createdAt: 'desc' };
  }

  try {
    // Build OR conditions for filters that are set
    let orConditions = [];

    // City filter with partial matching (case-insensitive)
    const cityFilter = filterValue(query.city && query.city.trim());
    if (cityFilter) {
      orConditions.push({
        city: {
          contains: cityFilter,
          mode: 'insensitive',
        },
      });
    }

    // Type filter
    const typeFilter = filterValue(query.type);
    if (typeFilter) {
      orConditions.push({ type: typeFilter });
    }

    // Property filter
    const propertyFilter = filterValue(query.property);
    if (propertyFilter) {
      orConditions.push({ property: propertyFilter });
    }

    // Bedroom filter
    const bedroomFilter = filterValue(parseInt(query.bedroom));
    if (bedroomFilter) {
      orConditions.push({ bedroom: bedroomFilter });
    }

    // Price filter
    const minPrice = filterValue(query.minPrice);
    const maxPrice = filterValue(query.maxPrice);
    if (minPrice || maxPrice) {
      let priceCond = {};
      if (minPrice) priceCond.gte = parseInt(minPrice);
      if (maxPrice) priceCond.lte = parseInt(maxPrice);
      orConditions.push({ price: priceCond });
    }

    // Debug log to see what we're querying
    console.log('OR Query filters:', orConditions);

    const posts = await prisma.post.findMany({
      where: orConditions.length > 0 ? { OR: orConditions } : undefined,
      ...(orderBy && { orderBy }),
    });

    console.log(`Found ${posts.length} posts`);
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
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
