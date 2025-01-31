import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/clodinary.js";
import mongoose from "mongoose";
import { getReceiverSocketId ,io} from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getMessages = async (req, res) => {
//   try {
//     const { id: userToChatId } = req.params;
//     const myId = req.user?._id; // Ensure req.user exists

//     console.log("Received userToChatId:", userToChatId);
//     console.log("Received myId:", myId);

//     // Validate ObjectId format
//     if (!mongoose.Types.ObjectId.isValid(userToChatId) || !mongoose.Types.ObjectId.isValid(myId)) {
//       return res.status(400).json({ message: "Invalid user ID(s)" });
//     }

//     const messages = await Message.find({
//       $or: [
//         { senderId: new mongoose.Types.ObjectId(myId), receiverId: new mongoose.Types.ObjectId(userToChatId) },
//         { senderId: new mongoose.Types.ObjectId(userToChatId), receiverId: new mongoose.Types.ObjectId(myId) }
//       ]
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("Error in getMessages controller:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


export const sendMessage = async (req, res) => {
  try {
    const {text,image}= req.body;
    const {id:receiverId} = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({senderId,receiverId,text,image:imageUrl});

    await newMessage.save();

    const receiverSokectId = getReceiverSocketId(receiverId);
    if(receiverId){
      io.to(receiverSokectId).emit("newMessage",newMessage);
    }

    res.status(201).json(newMessage );
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};