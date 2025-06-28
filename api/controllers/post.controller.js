import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    let posts = [];
    // If city is provided, search for city (case-insensitive, partial match)
    if (query.city) {
      posts = await prisma.post.findMany({
        where: {
          city: { contains: query.city, mode: "insensitive" },
          ...(query.type && { type: query.type }),
          ...(query.property && { property: query.property }),
          ...(query.bedroom && { bedroom: parseInt(query.bedroom) }),
          ...((query.minPrice || query.maxPrice) && {
            price: {
              ...(query.minPrice && { gte: parseInt(query.minPrice) }),
              ...(query.maxPrice && { lte: parseInt(query.maxPrice) }),
            },
          }),
        },
      });
      // If no posts found for city, fallback to all posts (or you can return empty array if you don't want fallback)
      if (posts.length === 0) {
        posts = await prisma.post.findMany({
          where: {
            ...(query.type && { type: query.type }),
            ...(query.property && { property: query.property }),
            ...(query.bedroom && { bedroom: parseInt(query.bedroom) }),
            ...((query.minPrice || query.maxPrice) && {
              price: {
                ...(query.minPrice && { gte: parseInt(query.minPrice) }),
                ...(query.maxPrice && { lte: parseInt(query.maxPrice) }),
              },
            }),
          },
        });
      }
    } else {
      // No city filter, just use other filters
      posts = await prisma.post.findMany({
        where: {
          ...(query.type && { type: query.type }),
          ...(query.property && { property: query.property }),
          ...(query.bedroom && { bedroom: parseInt(query.bedroom) }),
          ...((query.minPrice || query.maxPrice) && {
            price: {
              ...(query.minPrice && { gte: parseInt(query.minPrice) }),
              ...(query.maxPrice && { lte: parseInt(query.maxPrice) }),
            },
          }),
        },
      });
    }
    res.status(200).json(Array.isArray(posts) ? posts : []);
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
