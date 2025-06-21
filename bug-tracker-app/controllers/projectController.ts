import mongoose from "mongoose";
import { Project, ProjectInt, TeamMember } from "@/models/projectModel";
import User from "@/models/userModel";
import Bug, { IBug } from "@/models/bugModel";

// Type for lean TeamMember
type LeanTeamMember = {
  userId: string;
  role:
    | "Project Manager"
    | "Team Lead"
    | "Senior Developer"
    | "Developer"
    | "QA Engineer";
  joinedAt: Date;
};

// Type for lean Project document
type LeanProject = {
  _id: string;
  name: string;
  description?: string;
  status: "Active" | "Archived";
  team: string[];
  teamMembers: LeanTeamMember[];
  managerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  memberCount?: number;
  activities?: { created: Date; updated: Date; members: number };
  dueDate?: Date;
};

// Type for lean Bug document - Updated to match Mongoose lean result
type LeanBug = {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical";
  __v?: number;
};

export const getAllProjects = async (userId: string) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const projects = (await Project.find({
      $or: [
        { "teamMembers.userId": userObjectId },
        { managerId: userObjectId },
      ],
    })
      .select(
        "name description status team teamMembers managerId createdAt updatedAt dueDate"
      )
      .lean()) as LeanProject[];

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalBugs = await Bug.countDocuments({ projectId: project._id });
        const openBugs = await Bug.countDocuments({
          projectId: project._id,
          status: { $in: ["Open", "In Progress"] },
        });
        return {
          ...project,
          id: project._id,
          totalBugs,
          openBugs,
          progress: totalBugs
            ? Math.round(((totalBugs - openBugs) / totalBugs) * 100)
            : 0,
          team: project.teamMembers.map((member) => member.userId),
        };
      })
    );

    return projectsWithStats;
  } catch (error: any) {
    console.error("getAllProjects error:", error.message);
    throw new Error("Failed to fetch projects");
  }
};

export const createProject = async (data: any, createdBy: string) => {
  try {
    const { name, description, managerId, dueDate } = data;
    if (!name || !managerId) {
      throw new Error("Name and manager are required");
    }

    const user = await User.findById(managerId);
    if (!user) {
      throw new Error("Manager not found");
    }

    const newProject = new Project({
      name,
      description,
      status: "Active",
      team: [],
      teamMembers: [
        {
          userId: new mongoose.Types.ObjectId(managerId),
          role: "Project Manager",
          joinedAt: new Date(),
        },
      ],
      managerId: new mongoose.Types.ObjectId(managerId),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await newProject.save();
    return newProject.toObject() as LeanProject;
  } catch (error: any) {
    console.error("createProject error:", error.message);
    throw error;
  }
};

export const getProjectById = async (projectId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const project = (await Project.findById(projectId)
      .select(
        "name description status team teamMembers managerId createdAt updatedAt dueDate"
      )
      .lean()) as LeanProject;

    if (!project) {
      throw new Error("Project not found");
    }

    const isMember = project.teamMembers.some(
      (member) => member.userId === userId
    );
    const isManager = project.managerId === userId;

    if (!isMember && !isManager) {
      throw new Error("Forbidden");
    }

    const totalBugs = await Bug.countDocuments({ projectId });
    const openBugs = await Bug.countDocuments({
      projectId,
      status: { $in: ["Open", "In Progress"] },
    });

    return {
      ...project,
      id: project._id,
      totalBugs,
      openBugs,
      progress: totalBugs
        ? Math.round(((totalBugs - openBugs) / totalBugs) * 100)
        : 0,
      team: project.teamMembers.map((member) => member.userId),
    };
  } catch (error: any) {
    console.error("getProjectById error:", error.message);
    throw error;
  }
};

export const updateProject = async (
  projectId: string,
  data: any,
  userId: string
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const user = await User.findById(userId).select("role");
    if (!user || !["Admin", "Project Manager"].includes(user.role)) {
      throw new Error("Forbidden");
    }

    const { name, description, status, dueDate } = data;
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (dueDate) project.dueDate = new Date(dueDate);

    await project.save();
    return project.toObject() as LeanProject;
  } catch (error: any) {
    console.error("updateProject error:", error.message);
    throw error;
  }
};

export const deleteProject = async (projectId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const user = await User.findById(userId).select("role");
    if (!user || !["Admin", "Project Manager"].includes(user.role)) {
      throw new Error("Forbidden");
    }

    await project.deleteOne();
    return { message: "Project deleted" };
  } catch (error: any) {
    console.error("deleteProject error:", error.message);
    throw new Error("Failed to delete project");
  }
};

export const getProjectBugs = async (projectId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const project = (await Project.findById(projectId)
      .select("teamMembers managerId")
      .lean()) as LeanProject;
    if (!project) {
      throw new Error("Project not found");
    }

    const isMember = project.teamMembers.some(
      (member) => member.userId === userId
    );
    const isManager = project.managerId === userId;

    if (!isMember && !isManager) {
      throw new Error("Forbidden");
    }

    const bugs = await Bug.find({
      projectId: new mongoose.Types.ObjectId(projectId),
    })
      .select("_id title status priority severity")
      .lean<
        Array<{
          _id: mongoose.Types.ObjectId;
          title: string;
          status: string;
          priority: string;
          severity: string;
        }>
      >();

    return bugs.map((bug) => ({
      id: bug._id.toString(),
      _id: bug._id.toString(),
      title: bug.title,
      status: bug.status as "Open" | "In Progress" | "Resolved" | "Closed",
      priority: bug.priority as "Low" | "Medium" | "High" | "Critical",
      severity: bug.severity as "Minor" | "Major" | "Critical",
    }));
  } catch (error: any) {
    console.error("getProjectBugs error:", error.message);
    throw new Error("Failed to fetch project bugs");
  }
};

export const getProjectTeam = async (projectId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const project = (await Project.findById(projectId)
      .select("teamMembers managerId")
      .lean()) as LeanProject;
    if (!project) {
      throw new Error("Project not found");
    }

    const isMember = project.teamMembers.some(
      (member) => member.userId === userId
    );
    const isManager = project.managerId === userId;

    if (!isMember && !isManager) {
      throw new Error("Forbidden");
    }

    const teamMembers = await User.find({
      _id: {
        $in: project.teamMembers.map(
          (m) => new mongoose.Types.ObjectId(m.userId)
        ),
      },
    }).select("name email role");

    return project.teamMembers.map((member) => ({
      user: {
        _id: member.userId,
        name:
          teamMembers.find((u) => u._id.toString() === member.userId)?.name ||
          "",
        email:
          teamMembers.find((u) => u._id.toString() === member.userId)?.email ||
          "",
        role:
          teamMembers.find((u) => u._id.toString() === member.userId)?.role ||
          "",
      },
      role: member.role,
      joinedAt: member.joinedAt,
    }));
  } catch (error: any) {
    console.error("getProjectTeam error:", error.message);
    throw new Error("Failed to fetch project team");
  }
};
