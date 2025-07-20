import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  image?: string;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  teamIds: mongoose.Types.ObjectId[];
  badges: Badge[];
  authProvider?: "GOOGLE" | "GITHUB";
  authProviderId?: string;
  notificationsEnabled: boolean;
  themePreference: "light" | "dark" | "system";
  phone?: string;
  location?: string;
  bio?: string;
  department?: string;
  jobTitle?: string;
  startDate?: Date;
  salary?: string;
  skills?: string[];
  status?: "online" | "away" | "offline";
  // Stripe fields // razorpay we will implement later after deployment this is just for refreence later that's it we are not using and implemented this .
  stripeCustomerId?: string;
  subscriptionStatus?: "inactive" | "active" | "canceled" | "past_due";
  subscriptionId?: string;
  subscriptionPlan?: string;
  nextBillingDate?: Date;

  comparePassword(enteredPassword: string): Promise<boolean>;
}

interface Badge {
  name: string;
  description: string;
  earnedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.authProvider;
      },
      validate: {
        validator: function (this: IUser, value: string | null) {
          if (this.authProvider) return true;
          return value != null && value.length >= 8;
        },
        message: "Password is required and must be at least 8 characters long",
      },
    },
    image: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["Admin", "Project Manager", "Developer", "Tester"],
      default: "Developer",
    },
    teamIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    badges: [
      {
        name: String,
        description: String,
        earnedAt: Date,
      },
    ],
    authProvider: {
      type: String,
      enum: ["GOOGLE", "GITHUB"],
    },
    authProviderId: {
      type: String,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    salary: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["online", "away", "offline"],
      default: "offline",
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "canceled", "past_due"],
      default: "inactive",
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    subscriptionPlan: {
      type: String,
      default: null,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ teamIds: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ stripeCustomerId: 1 });
userSchema.index({ subscriptionStatus: 1 });

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.virtual("fullName").get(function (this: IUser) {
  return this.name;
});

userSchema.methods.getTeamPerformance = async function () {
  const Team = mongoose.model("Team");
  const teams = await Team.find({ "members.userId": this._id });

  let totalWorkload = 0;
  let totalAssigned = 0;
  let totalResolved = 0;

  teams.forEach((team: any) => {
    const memberData = team.members.find(
      (member: any) => member.userId.toString() === this._id.toString()
    );
    if (memberData) {
      totalWorkload += memberData.workload || 0;
      totalAssigned += memberData.assignedBugs || 0;
      totalResolved += memberData.resolvedBugs || 0;
    }
  });

  return {
    teams: teams.length,
    avgWorkload:
      teams.length > 0 ? Math.round(totalWorkload / teams.length) : 0,
    totalAssigned,
    totalResolved,
    resolutionRate:
      totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0,
  };
};

const User = mongoose.models.User || model<IUser>("User", userSchema);

export default User;
