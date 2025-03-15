// src/components/SignIn.jsx
import React from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Auth.css';
import Logo from '../assets/Logo.svg';
import axios from "axios";

// Define API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: 'none'
    }
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword before sending payload if not needed
      const { confirmPassword, ...payload } = data;
      console.log(payload);
      // Call backend signup endpoint
      const response = await axios.post(`${API_BASE_URL}/users/signup`, payload, {withCredentials: true});
      toast.success("Sign up successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error("Signup failed: " + (error.response?.data?.msg || error.message));
    }
  };

  const onError = (formErrors) => {
    Object.values(formErrors).forEach((error) => {
      toast.error(error.message);
    });
  };

  // Watch the role field to conditionally show fields
  const role = watch("role");

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link to="/">
          <img src={Logo} alt="UXENRICHER Logo" className="auth-logo" />
        </Link>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="auth-input"
          {...register("firstName", {
            required: "First name required",
            pattern: {
              value: /^[A-Za-z]+$/,
              message: "Only letters allowed"
            }
          })}
        />
        {errors.firstName && <p className="error">{errors.firstName.message}</p>}

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="auth-input"
          {...register("lastName", {
            required: "Last name required",
            pattern: {
              value: /^[A-Za-z]+$/,
              message: "Only letters allowed"
            }
          })}
        />
        {errors.lastName && <p className="error">{errors.lastName.message}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="auth-input"
          {...register("email", {
            required: "Email required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Valid email required"
            }
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="auth-input"
          autoComplete="new-password"
          {...register("password", {
            required: "Password required",
            minLength: {
              value: 8,
              message: "At least 8 characters"
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)/,
              message: "Include letters and numbers"
            }
          })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="auth-input"
          autoComplete="new-password"
          {...register("confirmPassword", {
            required: "Confirm your password",
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match"
          })}
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              {...register("role", { required: "Role is required" })}
            /> Student
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="employee"
              {...register("role", { required: "Role is required" })}
            /> Employee
          </label>
        </div>
        {errors.role && <p className="error">{errors.role.message}</p>}

        {role === 'student' && (
          <>
            <input
              type="text"
              name="university"
              placeholder="School/University"
              className="auth-input"
              {...register("university", {
                required: "School/University required"
              })}
            />
            {errors.university && <p className="error">{errors.university.message}</p>}
          </>
        )}

        {role === 'employee' && (
          <>
            <input
              type="text"
              name="position"
              placeholder="Job Position"
              className="auth-input"
              {...register("position", {
                required: "Job Position required"
              })}
            />
            {errors.position && <p className="error">{errors.position.message}</p>}
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              className="auth-input"
              {...register("company", {
                required: "Company Name required"
              })}
            />
            {errors.company && <p className="error">{errors.company.message}</p>}
          </>
        )}

        <button
          type="submit"
          onClick={handleSubmit(onSubmit, onError)}
          className="auth-btn primary-btn"
        >
          Sign Up
        </button>
        <p className="auth-alt-links">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <button type="button" className="auth-btn google-btn">
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Signup;
