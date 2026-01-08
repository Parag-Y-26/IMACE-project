"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  Target,
  FileText,
  Linkedin,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import { ALL_SKILLS, SKILL_CATEGORIES } from "@/types/types";
import type { UserProfile } from "@/types/types";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Your Name", icon: User, description: "Let's get to know you" },
  { id: 2, title: "Your Skills", icon: Briefcase, description: "What are you good at?" },
  { id: 3, title: "Your Goal", icon: Target, description: "Where do you want to be?" },
  { id: 4, title: "Marksheet", icon: FileText, description: "Upload your grades (optional)" },
  { id: 5, title: "LinkedIn", icon: Linkedin, description: "Connect your profile" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, userState } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    skills: [],
    goal: "",
    marksheet: undefined,
    marksheetName: undefined,
    linkedin: "",
  });

  // Custom skill input
  const [customSkill, setCustomSkill] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("programming");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already onboarded
  useEffect(() => {
    if (!userState.auth.isLoggedIn) {
      router.push("/login");
    } else if (userState.auth.isOnboarded) {
      router.push("/");
    }
  }, [userState, router]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "Please enter your name";
        } else if (formData.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        }
        break;
      case 2:
        if (formData.skills.length === 0) {
          newErrors.skills = "Please select at least one skill";
        }
        break;
      case 3:
        if (!formData.goal.trim()) {
          newErrors.goal = "Please enter your goal";
        } else if (formData.goal.trim().length < 10) {
          newErrors.goal = "Please describe your goal in more detail";
        }
        break;
      case 4:
        // Optional - no validation
        break;
      case 5:
        if (!formData.linkedin.trim()) {
          newErrors.linkedin = "Please enter your LinkedIn profile URL";
        } else if (!formData.linkedin.includes("linkedin.com")) {
          newErrors.linkedin = "Please enter a valid LinkedIn URL";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    completeOnboarding(formData);
    router.push("/");
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
    setErrors({});
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()],
      }));
      setCustomSkill("");
      setErrors({});
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ marksheet: "File size must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          marksheet: reader.result as string,
          marksheetName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      marksheet: undefined,
      marksheetName: undefined,
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
              <p className="text-gray-400">We'll use this to personalize your experience</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 blur" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setErrors({});
                }}
                placeholder="Enter your full name"
                className="relative w-full px-6 py-4 bg-[#1a1a2e] rounded-2xl border border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                autoFocus
              />
            </div>

            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Select your skills</h2>
              <p className="text-gray-400">Choose skills you're proficient in</p>
            </div>

            {/* Selected Skills */}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                {formData.skills.map((skill) => (
                  <motion.button
                    key={skill}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => toggleSkill(skill)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-cyan-400/30 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
                  >
                    <span>{skill}</span>
                    <X className="w-3 h-3" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Skill Categories */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                <div key={category} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedCategory(expandedCategory === category ? null : category)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-medium capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 text-gray-400 transition-transform",
                        expandedCategory === category && "rotate-90"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedCategory === category && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-2 p-4 pt-0">
                          {skills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-sm transition-all",
                                formData.skills.includes(skill)
                                  ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-400"
                                  : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/30"
                              )}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Custom Skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                placeholder="Add custom skill..."
                className="flex-1 px-4 py-3 bg-[#1a1a2e] rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
              <button
                onClick={addCustomSkill}
                disabled={!customSkill.trim()}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {errors.skills && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.skills}
              </motion.p>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">What's your goal?</h2>
              <p className="text-gray-400">Describe what you want to achieve</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 blur" />
              <textarea
                value={formData.goal}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, goal: e.target.value }));
                  setErrors({});
                }}
                placeholder="e.g., Become a full-stack software engineer at a top tech company"
                rows={4}
                className="relative w-full px-6 py-4 bg-[#1a1a2e] rounded-2xl border border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
              />
            </div>

            {/* Goal Suggestions */}
            <div className="space-y-2">
              <p className="text-gray-500 text-sm">Popular goals:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Software Engineer",
                  "Data Scientist",
                  "Product Manager",
                  "UX Designer",
                  "Entrepreneur",
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        goal: `Become a ${goal} at a leading company`,
                      }))
                    }
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm hover:border-cyan-400/50 hover:text-cyan-400 transition-colors"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {errors.goal && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.goal}
              </motion.p>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Marksheet</h2>
              <p className="text-gray-400">This helps us understand your academic progress (optional)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!formData.marksheet ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Click to upload</p>
                    <p className="text-gray-500 text-sm">PNG, JPG, or PDF up to 5MB</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{formData.marksheetName}</p>
                      <p className="text-gray-500 text-sm">Uploaded successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Skip this step
            </button>

            {errors.marksheet && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.marksheet}
              </motion.p>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Connect LinkedIn</h2>
              <p className="text-gray-400">Link your professional profile</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 blur" />
              <div className="relative flex items-center bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-4 py-4 border-r border-white/10">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                </div>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, linkedin: e.target.value }));
                    setErrors({});
                  }}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="flex-1 px-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {errors.linkedin && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.linkedin}
              </motion.p>
            )}

            {/* Profile Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">Profile Preview</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="text-white">{formData.name || "—"}</span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Skills:</span>{" "}
                  <span className="text-white">
                    {formData.skills.slice(0, 3).join(", ") || "—"}
                    {formData.skills.length > 3 && ` +${formData.skills.length - 3} more`}
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Goal:</span>{" "}
                  <span className="text-white">
                    {formData.goal.slice(0, 50) || "—"}
                    {formData.goal.length > 50 && "..."}
                  </span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-[100px]"
        />
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isCompleted && "bg-gradient-to-br from-purple-500 to-cyan-500",
                      isActive && "bg-white/10 ring-2 ring-cyan-400",
                      !isCompleted && !isActive && "bg-white/5"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon
                        className={cn(
                          "w-5 h-5",
                          isActive ? "text-cyan-400" : "text-gray-500"
                        )}
                      />
                    )}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 lg:w-24 h-0.5 mx-2",
                        isCompleted ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-white/10"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Info */}
          <div className="text-center">
            <p className="text-cyan-400 text-sm font-medium">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 p-6">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl transition-colors",
              currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <motion.button
            onClick={handleNext}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-purple-600 to-cyan-600",
              "hover:from-purple-500 hover:to-cyan-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Setting up...</span>
              </>
            ) : currentStep === 5 ? (
              <>
                <span>Complete Setup</span>
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
