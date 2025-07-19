const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");

const {
  userModel,
  newEmployeeModel,
  LeaveModel,
  eventModel,
  Position,
  TrainingModule,
  empModule,
  Attendance,
} = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: "Please Enter Your Credential To Continue",
      });
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.json({
        error: "User not found",
      });
    }

    const match = await comparePassword(password, user.password);
    if (match) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res
        .cookie("token", token)
        .json({ Status: true, Result: user, id: user._id });
    } else {
      res.json({ error: "Please Check Your Password" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
      if (err) throw err;
      res.json(userInfo);
    });
  } else {
    res.json(null);
  }
};

const getAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.find({ _id: id });
    if (!user) {
      return res.json({
        Error: "No Employee Found",
        Status: false,
      });
    }
    // console.log(user)
    res.json({ Status: true, Result: user });
  } catch {
    return res.json((error) => {
      console.log(error);
    });
  }
};

const editAdmin = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;
    const employee = await userModel.findById(req.params.id);

    if (!employee) {
      return res
        .status(404)
        .json({ Status: false, Message: "Admin not found" });
    }

    // Check if password needs to be updated
    if (password && password.trim() !== "") {
      const isMatch = await comparePassword(password, employee.password);
      if (!isMatch) {
        updateFields.password = await hashPassword(password);
      }
    }

    await userModel.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });
    res.json({ Status: true, Message: "Employee updated successfully" });
  } catch (error) {
    console.error("Failed to update employee:", error.message);
    res.status(500).json({
      Status: false,
      Message: "Failed to update employee",
      Error: error.message,
    });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      salary,
      address,
      category,
      position,
      dateofbirth,
      gender,
      martialStatus,
      bankAccount,
      taxId,
      postGraduation,
      graduation,
      schooling,
      doj,
    } = req.body;
    //check if detail's was entered
    if (!name || !email || !password || !salary || !address || !category) {
      return res.json({
        Error: `Input Argument is required`,
      });
    }
    if (password.length < 6) {
      return res.json({
        Error: "Password required should be of atleast 6 character long",
      });
    }
    const exist = await userModel.findOne({ email: email });
    if (exist) {
      return res.json({
        Error: "E-Mail Already Occupied",
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      salary,
      address,
      category,
      position,
      image: req.file ? req.file.filename : "",
      dateofbirth,
      gender,
      martialStatus,
      bankAccount,
      taxId,
      postGraduation,
      graduation,
      schooling,
      doj,
    });
    return res.json({ Status: true });
  } catch (error) {
    console.log(error);
  }
};

const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      salary,
      address,
      category,
      position,
      dateofbirth,
      gender,
      martialStatus,
      bankAccount,
      taxId,
      postGraduation,
      graduation,
      schooling,
      doj,
    } = req.body;
    //check if detail's was entered
    if (!name || !email || !password || !salary || !address || !category) {
      return res.json({
        Error: `Input Argument is required`,
      });
    }
    if (password.length < 6) {
      return res.json({
        Error: "Password required should be of atleast 6 character long",
      });
    }
    const exist = await newEmployeeModel.findOne({ email: email });
    if (exist) {
      return res.json({
        Error: "E-Mail Already Occupied",
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await newEmployeeModel.create({
      name,
      email,
      password: hashedPassword,
      salary,
      address,
      category,
      position,
      image: req.file ? req.file.filename : "",
      dateofbirth,
      gender,
      martialStatus,
      bankAccount,
      taxId,
      postGraduation,
      graduation,
      schooling,
      doj,
    });
    return res.json({ Status: true });
  } catch (error) {
    console.log(error);
  }
};

const getEmployee = async (req, res) => {
  try {
    const user = await newEmployeeModel.find({});
    if (!user) {
      return res.json({
        Error: "No Employee Found",
        Status: false,
      });
    }
    res.json({ Status: true, Result: user });
  } catch {
    return res.json(error);
  }
};

const specificEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await newEmployeeModel.find({ _id: id });
    if (!user) {
      return res.json({
        Error: "No Employee Found",
        Status: false,
      });
    }
    console.log(user);
    res.json({ Status: true, Result: user });
  } catch {
    return res.json((error) => {
      console.log(error);
    });
  }
};

const editEmployee = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;
    const employee = await newEmployeeModel.findById(req.params.id);

    if (!employee) {
      return res
        .status(404)
        .json({ Status: false, Message: "Employee not found" });
    }

    // Check if password needs to be updated
    if (password && password.trim() !== "") {
      const isMatch = await comparePassword(password, employee.password);
      if (!isMatch) {
        updateFields.password = await hashPassword(password);
      }
    }

    await newEmployeeModel.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });
    res.json({ Status: true, Message: "Employee updated successfully" });
  } catch (error) {
    console.error("Failed to update employee:", error.message);
    res.status(500).json({
      Status: false,
      Message: "Failed to update employee",
      Error: error.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await newEmployeeModel.deleteOne({ _id: id });
    return res.json({ Status: true, Result: user });
  } catch {
    console.log(error);
  }
};
const deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.deleteOne({ _id: id });
    return res.json({ Status: true, Result: user });
  } catch {
    console.log(error);
  }
};
const adminCount = async (req, res) => {
  const user = await userModel.countDocuments();
  return res.json({ Status: true, Result: user });
};
const empCount = async (req, res) => {
  const user = await newEmployeeModel.countDocuments();
  return res.json({ Status: true, Result: user });
};
const salCount = async (req, res) => {
  const user = await newEmployeeModel.find();
  var total = 1400000;
  user.forEach((e) => {
    total = total + e.salary;
  });
  return res.json({ Status: true, Result: total });
};

const adminRecords = async (req, res) => {
  const user = await userModel.find();
  return res.json({ Status: true, Result: user });
};

const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
};

const leavereq = async (req, res) => {
  const user = await LeaveModel.find({});
  return res.json({ Result: user });
};

const leaveStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const user = await LeaveModel.updateOne(
    { _id: id },
    {
      status: status,
    }
  );
  return res.json({ status: true });
};

const allpendingRequest = async (req, res) => {
  const user = await LeaveModel.find();
  return res.json({ Status: true, Result: user });
};

const pendingRequest = async (req, res) => {
  const id = req.params.id;
  const user = await LeaveModel.find({ empid: id });
  return res.json({ Status: true, Result: user });
};

const payroll = async (req, res) => {
  const user = await newEmployeeModel.find({});
  return res.json({ Status: true, Result: user });
};

const event = async (req, res) => {
  const { title, date, additional } = req.body;
  const user = await eventModel.create({
    title,
    date,
    additional,
  });
  res.json({ Status: true, Result: user });
};

const getEvent = async (req, res) => {
  try {
    const events = await eventModel.find({});
    return res.json({ Status: true, Result: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.json({ Status: false, Message: "Error fetching events" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await eventModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ Status: false, Message: "Event not found" });
    }
    return res.json({ Status: true });
  } catch (error) {
    console.log("Error deleting event:", error);
    return res
      .status(500)
      .json({ Status: false, Message: "Error deleting event" });
  }
};

const positions = async (req, res) => {
  const positions = await Position.find();
  res.json(positions);
};

const addPosition = async (req, res) => {
  const { name, number } = req.body;
  const newPosition = new Position({ name, number });
  await newPosition.save();
  res.json(newPosition);
};

const deletePosition = async (req, res) => {
  await Position.findByIdAndDelete(req.params.id);
  res.json({ message: "Position deleted" });
};

const trainingMaterial = async (req, res) => {
  const modules = await TrainingModule.find();
  res.json(modules);
};

const AddtrainingMaterial = async (req, res) => {
  const { name, file, department } = req.body;
  const module = new TrainingModule({ name, file, department });
  await module.save();
  res.send(module);
};

const deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the TrainingModule to delete
    const deletedTrainingModule = await TrainingModule.findByIdAndDelete(id);
    if (!deletedTrainingModule) {
      return res.status(404).json({ error: "TrainingModule not found" });
    }
    // Delete related EmployeeModules
    await empModule.deleteMany({ moduleId: deletedTrainingModule._id });
    // Return success response
    res.status(200).json({ message: "TrainingModule deleted successfully" });
  } catch (error) {
    console.error("Error deleting TrainingModule:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markAttendance = async (req, res) => {
  const { attendanceData, date } = req.body;
  console.log(attendanceData);
 try {
  const formattedDate = new Date(date).toISOString().slice(0, 10);

  for (const [employeeId, status] of Object.entries(attendanceData)) {
    if (employeeId && status) {
      await Attendance.findOneAndUpdate(
        { employeeId: employeeId, date: formattedDate },
        { status },
        { upsert: true, new: true }
      );
    }
  }

  res.status(200).json({ message: "Attendance marked successfully" });
} catch (error) {
  console.error("Error in attendance submission:", error);
  res.status(500).json({ message: "Failed to mark attendance", error });
}

};
// // controllers/attendanceController.js
// const getCatagoryWiseAttendance = async (req, res) => {
//   const { catagoryName } = req.params;
//   console.log(catagoryName);
//   try {
//     // Fetch employees by catagory
//     const employees = await newEmployeeModel.find({ category: catagoryName });
//     console.log(employees, { category: catagoryName });
//     if (!employees.length) {
//       console.log("No employees found for the given class.");
//       return res.status(404).json({ message: "No employees found" });
//     }

//     const result = await Attendance.aggregate([
//   {
//     $lookup: {
//       from: "employees",
//       localField: "employeeId",
//       foreignField: "_id",
//       as: "employeeData"
//     }
//   },
//   {
//     $unwind: "$employeeData"
//   },
//   {
//     $match: {
//       $expr: {
//         $gte: ["$date", "$employeeData.dateOfJoin"]
//       }
//     }
//   },
//   {
//     $group: {
//       _id: "$employeeId",
//       name: { $first: "$employeeData.name" },
//       dateOfJoin: { $first: "$employeeData.dateOfJoin" },
//       totalPresent: {
//         $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
//       },
//       totalDays: { $sum: 1 }
//     }
//   }
// ]);

//     // Get total number of days
//     let totalDays = await Attendance.distinct("date").countDocuments();
//     console.log(totalDays,"total")
//     // if (totalDays === 0) {
//     //   console.log("No attendance records found.");
//     //   return res.status(404).json({ message: "No attendance records found" });
//     // }
//     if (totalDays === 0) {
//       console.log("No attendance records found. Adding today's date...");
//     }
//     //   const today = new Date();
//     //   const newEmployee = employees[0]; // Pick the first employee for placeholder record
//     //   await Attendance.create({
//     //     employeeId: newEmployee._id,
//     //     status: "Present",
//     //     // `date` will default to Date.now
//     //   });

//     //   totalDays = await Attendance.distinct("date").countDocuments();
//     // }
//     // Calculate attendance percentages
//     const attendanceData = await Promise.all(
//       employees.map(async (employee) => {
//         const totalPresentDays = await Attendance.countDocuments({
//           employeeId: employee._id,
//           status: "Present",
//         });
//         console.log(totalDays, employee);
//         const percentage = (totalPresentDays / totalDays) * 100;

//         return {
//           employeeId: employee._id,
//           employeeName: employee.name,
//           category: employee.category,
//           totalPresentDays,
//           percentage: percentage.toFixed(2),
//         };
//       })
//     );

//     res.status(200).json(attendanceData);
//   } catch (error) {
//     console.error("Failed to get catagory-wise attendance:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to get catagory-wise attendance", error });
//   }
// };


const getCatagoryWiseAttendance = async (req, res) => {
  const { catagoryName } = req.params;
  console.log("Category:", catagoryName);

  try {
    // Step 1: Fetch employees by category
    const employees = await newEmployeeModel.find({ category: catagoryName });

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found" });
    }

    // Step 2: Process attendance per employee based on their dateOfJoin
    const attendanceData = await Promise.all(
      employees.map(async (employee) => {
        const { _id, name, category, doj } = employee;

        // Format dateOfJoin to date-only string
        const joinDate = new Date(doj).toISOString().split("T")[0];

        // Attendance dates since dateOfJoin
        const attendanceDates = await Attendance.distinct("date", {
          employeeId: _id,
          date: { $gte: new Date(joinDate) }
        });
        const totalDaysSinceJoin = attendanceDates.length;

        // Present count since dateOfJoin
        const totalPresentDays = await Attendance.countDocuments({
          employeeId: _id,
          status: "Present",
          date: { $gte: new Date(joinDate) }
        });

        const percentage = totalDaysSinceJoin > 0
          ? (totalPresentDays / totalDaysSinceJoin) * 100
          : 0;

        return {
          employeeId: _id,
          employeeName: name,
          category,
          doj: joinDate,
          totalDaysSinceJoin,
          totalPresentDays,
          percentage: percentage.toFixed(2)
        };
      })
    );

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error("Failed to get category-wise attendance:", error);
    res.status(500).json({
      message: "Failed to get category-wise attendance",
      error: error.message
    });
  }
};




const gemini=async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to Gemini API." });
  }
};

module.exports = {
  addEmployee,
  getAdmin,
  editAdmin,
  loginUser,
  getProfile,
  getEmployee,
  deleteEmployee,
  specificEmployee,
  editEmployee,
  adminCount,
  salCount,
  empCount,
  adminRecords,
  deleteAdmin,
  logout,
  leavereq,
  leaveStatus,
  pendingRequest,
  allpendingRequest,
  payroll,
  event,
  getEvent,
  deleteEvent,
  registerAdmin,
  positions,
  addPosition,
  deletePosition,
  trainingMaterial,
  AddtrainingMaterial,
  deleteMaterial,
  markAttendance,
  getCatagoryWiseAttendance,
  gemini
};
