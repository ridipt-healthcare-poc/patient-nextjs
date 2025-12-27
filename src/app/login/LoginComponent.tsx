'use client'

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Select,
    Flex,
    Link,
    IconButton,
    useColorModeValue,
    HStack,
    Stack,
    SimpleGrid,
    GridItem,
    useBreakpointValue,
    Image,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Spinner,
} from "@chakra-ui/react";
import {
    FaUser,
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaLock,
    FaHeart,
    FaPhoneAlt,
    FaCalendarAlt,
    FaPhone,
} from "react-icons/fa";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 🎨 Patient-themed color palette (softer, warmer tones)
const PRIMARY_COLOR = "#0F4C75";
const PRIMARY_GRADIENT = "linear(to-br, #06B6D4 0%, #0F4C75 100%)";
const ACCENT_COLOR = "#14B8A6";

const ambientBgImage =
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80";
const heroImage =
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80";

const Login = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
    });
    const [loginData, setLoginData] = useState({ mobile: "", otp: "" });
    const [signupErrors, setSignupErrors] = useState({});
    const [loginErrors, setLoginErrors] = useState({});
    const [localLoading, setLocalLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { sendOTP, loginWithOTP, signup } = useAuth();
    const toast = useToast();
    const router = useRouter();

    // Forgot Password State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = reset
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotToken, setForgotToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (isSignup) {
            setSignupData((prev) => ({ ...prev, [name]: value }));
            setSignupErrors((prev) => ({ ...prev, [name]: "" }));
        } else {
            setLoginData((prev) => ({ ...prev, [name]: value }));
            setLoginErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Handle Send OTP
    const handleSendOTP = async () => {
        if (!loginData.mobile || loginData.mobile.length !== 10) {
            toast({
                title: "Please enter a valid 10-digit mobile number",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLocalLoading(true);
        try {
            await sendOTP(loginData.mobile);
            setOtpSent(true);
            setCountdown(60);
            toast({
                title: "OTP Sent!",
                description: "Please check your mobile for OTP (Use: 123456)",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        } catch (err: any) {
            toast({
                title: err.response?.data?.message || "Failed to send OTP",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLocalLoading(false);
        }
    };

    // Countdown timer for OTP resend
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalLoading(true);
        try {
            if (isSignup) {
                await signup(signupData);
                toast({
                    title: "Registration Successful",
                    description: "Please sign in with OTP",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                setIsSignup(false);
            } else {
                if (!otpSent) {
                    toast({
                        title: "Please send OTP first",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }
                await loginWithOTP(loginData.mobile, loginData.otp);
                toast({
                    title: "Welcome Back!",
                    description: "You have successfully logged in",
                    status: "success",
                    duration: 2500,
                    isClosable: true,
                });
                router.push("/dashboard");
            }
        } catch (err: any) {
            toast({
                title: err.response?.data?.message || "Something went wrong",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLocalLoading(false);
        }
    };

    // Forgot Password Step 1: Request email
    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/patient/auth/forgot-password`,
                { email: forgotEmail }
            );
            toast({
                title: "Reset email sent",
                description: "Please check your email for the reset link/token.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
            setForgotStep(2);
        } catch (error: any) {
            toast({
                title: "Error",
                description:
                    error.response?.data?.message || "Could not initiate password reset.",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } finally {
            setResetLoading(false);
        }
    };

    // Forgot Password Step 2: Enter token & new password
    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!forgotToken || !newPassword) {
            toast({
                title: "All fields are required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setResetLoading(true);
        try {
            await axios.post(
                `${API_BASE_URL}/api/patient/auth/reset-password/${forgotToken}`,
                { newPassword }
            );
            toast({
                title: "Password Reset Successful",
                description: "You may now log in with your new password.",
                status: "success",
                duration: 3500,
                isClosable: true,
            });
            setForgotStep(1);
            setForgotEmail("");
            setForgotToken("");
            setNewPassword("");
            onClose();
        } catch (err: any) {
            toast({
                title: "Reset failed",
                description:
                    err.response?.data?.message ||
                    "Invalid token or something went wrong.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setResetLoading(false);
        }
    };

    const pageBg = useColorModeValue(
        "linear-gradient(135deg, #ECFEFF 0%, #E0F2FE 50%, #F8FAFC 100%)",
        "linear-gradient(135deg, #0F172A 0%, #0B1120 45%, #082F49 100%)"
    );
    const cardBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.9)");
    const inputBg = useColorModeValue("white", "rgba(15,23,42,0.85)");
    const subtleText = useColorModeValue("gray.600", "gray.300");
    const accentLinkColor = useColorModeValue("#0891B2", "#5EEAD4");
    const layoutPadding = useBreakpointValue({ base: 6, md: 10 });
    const focusBorderColor = useColorModeValue("#14B8A6", "#2DD4BF");
    const containerWidth = isSignup
        ? { base: "92%", md: "920px", lg: "100%" }
        : { base: "88%", md: "840px", lg: "900px" };
    const containerMaxWidth = isSignup ? "5xl" : "4xl";
    const formGridColumns = isSignup ? { base: 1, md: 2 } : { base: 1 };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={pageBg}
            position="relative"
            overflow="hidden"
        >
            <Box
                position="absolute"
                inset={0}
                bgImage={`url(${ambientBgImage})`}
                bgSize="cover"
                bgPosition="center"
                opacity={0.18}
                filter="blur(6px)"
                zIndex={0}
            />
            <Box
                position="absolute"
                top={{ base: "-120px", md: "-180px" }}
                right={{ base: "-80px", md: "-160px" }}
                w={{ base: "260px", md: "420px" }}
                h={{ base: "260px", md: "420px" }}
                bgGradient="radial(#5EEAD4 0%, transparent 65%)"
                opacity={0.45}
                filter="blur(2px)"
                zIndex={0}
            />
            <Box
                position="absolute"
                bottom={{ base: "-140px", md: "-200px" }}
                left={{ base: "-100px", md: "-180px" }}
                w={{ base: "300px", md: "480px" }}
                h={{ base: "300px", md: "480px" }}
                bgGradient="radial(#06B6D4 0%, transparent 70%)"
                opacity={0.32}
                filter="blur(3px)"
                zIndex={0}
            />

            {/* Main Container */}
            <Flex
                position="relative"
                zIndex={1}
                bg={cardBg}
                backdropFilter="blur(18px)"
                border="1px solid rgba(6,182,212,0.18)"
                boxShadow="0 14px 42px -18px rgba(8,145,178,0.35)"
                rounded="3xl"
                overflow="hidden"
                w={containerWidth}
                maxW={containerMaxWidth}
            >
                {/* Left Illustration Section */}
                <Box
                    display={{ base: "none", md: "flex" }}
                    flex={isSignup ? 0.65 : 1}
                    bgGradient="linear(to-br, rgba(6,182,212,0.95), rgba(15,76,117,0.98))"
                    position="relative"
                    color="white"
                    p={10}
                    overflow="hidden"
                >
                    <Flex direction="column" justify="space-between" w="full">
                        <Box>
                            <HStack spacing={3}>
                                <Box
                                    w={10}
                                    h={10}
                                    bg="whiteAlpha.200"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    boxShadow="0 10px 25px -15px rgba(8,145,178,0.7)"
                                >
                                    <FaHeart size={20} />
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" letterSpacing="wide">
                                        Patient Portal
                                    </Text>
                                    <Text fontSize="xs">
                                        Health Care Digitalized
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>

                        <Box position="relative" alignSelf="center" mt={8} mb={8}>
                            <Box
                                position="absolute"
                                top="-20%"
                                left="-20%"
                                w="280px"
                                h="280px"
                                bg="whiteAlpha.200"
                                rounded="50%"
                                filter="blur(40px)"
                            />
                            <Box
                                position="relative"
                                w="260px"
                                h="260px"
                                bg="linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))"
                                border="1px solid rgba(255,255,255,0.2)"
                                rounded="3xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                overflow="hidden"
                                boxShadow="0 20px 40px -18px rgba(8,47,73,0.7)"
                            >
                                <Image
                                    src={heroImage}
                                    alt="Patient care hero"
                                    objectFit="cover"
                                    w="full"
                                    h="full"
                                />
                                <Box
                                    position="absolute"
                                    inset={0}
                                    bg="linear-gradient(180deg, rgba(6,182,212,0.25) 0%, transparent 60%)"
                                />
                                <Box
                                    position="absolute"
                                    bottom="24px"
                                    left="24px"
                                    right="24px"
                                    bg="rgba(8,47,73,0.65)"
                                    rounded="lg"
                                    px={4}
                                    py={3}
                                >
                                    <Text fontWeight="semibold">Your Health, Our Priority</Text>
                                    <Text fontSize="xs" color="whiteAlpha.700">
                                        Access your health records and appointments anytime, anywhere.
                                    </Text>
                                </Box>
                            </Box>
                            <Box
                                position="absolute"
                                top="18%"
                                right="-18%"
                                w="92px"
                                h="92px"
                                bg="linear-gradient(135deg, #2dd4bf, #5eead4)"
                                rounded="3xl"
                                transform="rotate(25deg)"
                                boxShadow="0 12px 30px -16px rgba(45,212,191,0.8)"
                            />
                            <Box
                                position="absolute"
                                bottom="-12%"
                                left="-14%"
                                w="120px"
                                h="120px"
                                border="3px solid rgba(255,255,255,0.35)"
                                rounded="full"
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" color="whiteAlpha.800" maxW="80%" mt={-10}>
                                "Manage your appointments, view test results, and communicate with your healthcare providers
                                all in one secure place."
                            </Text>
                        </Box>
                    </Flex>


                </Box>

                <Box
                    flex={1.1}
                    p={layoutPadding}
                    bg="rgba(255,255,255,0.6)"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <VStack
                        spacing={8}
                        w="full"
                        maxW={isSignup ? { base: "full", md: "600px" } : { base: "full", md: "500px" }}
                    >
                        <HStack spacing={3} align="center">
                            <Box
                                h={{ base: "36px", md: "35px" }}
                                display="flex"
                                alignItems="center"
                            >
                                <Text
                                    fontSize={{ base: "2xl", md: "3xl" }}
                                    fontWeight="bold"
                                    bgGradient={PRIMARY_GRADIENT}
                                    bgClip="text"
                                >
                                    Patient Portal
                                </Text>
                            </Box>
                        </HStack>

                        <Box
                            bg="white"
                            rounded="2xl"
                            p={{ base: 6, md: 8 }}
                            boxShadow="0 18px 35px -25px rgba(15,76,117,0.45)"
                            border="1px solid rgba(148,163,184,0.15)"
                        >
                            <HStack
                                spacing={1}
                                bg="gray.100"
                                p={1}
                                rounded="full"
                                mb={6}
                            >
                                <Button
                                    flex={1}
                                    variant="ghost"
                                    onClick={() => setIsSignup(true)}
                                    bg={isSignup ? "white" : "transparent"}
                                    color={isSignup ? PRIMARY_COLOR : "gray.500"}
                                    fontWeight="semibold"
                                    size="sm"
                                    rounded="full"
                                    _hover={{ bg: isSignup ? "white" : "whiteAlpha.600" }}
                                    boxShadow={isSignup ? "sm" : "none"}
                                >
                                    Sign Up
                                </Button>
                                <Button
                                    flex={1}
                                    variant="ghost"
                                    onClick={() => setIsSignup(false)}
                                    bg={!isSignup ? "white" : "transparent"}
                                    color={!isSignup ? PRIMARY_COLOR : "gray.500"}
                                    fontWeight="semibold"
                                    size="sm"
                                    rounded="full"
                                    _hover={{ bg: !isSignup ? "white" : "whiteAlpha.600" }}
                                    boxShadow={!isSignup ? "sm" : "none"}
                                >
                                    Sign In
                                </Button>
                            </HStack>

                            <form onSubmit={handleSubmit}>
                                <VStack spacing={4} align="stretch">
                                    <SimpleGrid columns={formGridColumns} spacing={4} w="full">
                                        {isSignup && (
                                            <>
                                                <GridItem>
                                                    <FormControl isRequired>
                                                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                            Full Name
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" color="teal.500">
                                                                <FaUser />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="name"
                                                                value={signupData.name}
                                                                onChange={handleChange}
                                                                placeholder="John Doe"
                                                                bg={inputBg}
                                                                borderColor="rgba(6,182,212,0.25)"
                                                                focusBorderColor={focusBorderColor}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>
                                                </GridItem>

                                                <GridItem>
                                                    <FormControl isRequired>
                                                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                            Phone
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" color="teal.500">
                                                                <FaPhoneAlt />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="phone"
                                                                type="tel"
                                                                value={signupData.phone}
                                                                onChange={handleChange}
                                                                placeholder="10-digit phone number"
                                                                bg={inputBg}
                                                                borderColor="rgba(6,182,212,0.25)"
                                                                focusBorderColor={focusBorderColor}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>
                                                </GridItem>

                                                <GridItem>
                                                    <FormControl isRequired>
                                                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                            Gender
                                                        </FormLabel>
                                                        <Select
                                                            name="gender"
                                                            value={signupData.gender}
                                                            onChange={handleChange}
                                                            placeholder="Select gender"
                                                            bg={inputBg}
                                                            borderColor="rgba(6,182,212,0.25)"
                                                            focusBorderColor={focusBorderColor}
                                                        >
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </Select>
                                                    </FormControl>
                                                </GridItem>

                                                <GridItem>
                                                    <FormControl isRequired>
                                                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                            Date of Birth
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" color="teal.500">
                                                                <FaCalendarAlt />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="dateOfBirth"
                                                                type="date"
                                                                value={signupData.dateOfBirth}
                                                                onChange={handleChange}
                                                                max={new Date().toISOString().split("T")[0]}
                                                                bg={inputBg}
                                                                borderColor="rgba(6,182,212,0.25)"
                                                                focusBorderColor={focusBorderColor}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>
                                                </GridItem>
                                            </>
                                        )}

                                        {!isSignup && (
                                            <>
                                                <GridItem>
                                                    <FormControl isRequired>
                                                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                            Mobile Number
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" color="teal.500">
                                                                <FaPhoneAlt />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="mobile"
                                                                type="tel"
                                                                placeholder="10-digit mobile number"
                                                                value={loginData.mobile}
                                                                onChange={handleChange}
                                                                bg={inputBg}
                                                                borderColor="rgba(6,182,212,0.25)"
                                                                focusBorderColor={focusBorderColor}
                                                                maxLength={10}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>
                                                </GridItem>

                                                <GridItem>
                                                    <FormControl>
                                                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                            &nbsp;
                                                        </FormLabel>
                                                        <Button
                                                            w="full"
                                                            onClick={handleSendOTP}
                                                            isLoading={localLoading}
                                                            isDisabled={countdown > 0 || !loginData.mobile}
                                                            bgGradient={PRIMARY_GRADIENT}
                                                            color="white"
                                                            _hover={{
                                                                bgGradient: "linear(to-r, #06B6D4, #0F4C75)",
                                                            }}
                                                        >
                                                            {countdown > 0 ? `Resend in ${countdown}s` : otpSent ? "Resend OTP" : "Send OTP"}
                                                        </Button>
                                                    </FormControl>
                                                </GridItem>

                                                {otpSent && (
                                                    <GridItem>
                                                        <FormControl isRequired>
                                                            <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                                Enter OTP
                                                            </FormLabel>
                                                            <InputGroup>
                                                                <InputLeftElement pointerEvents="none" color="teal.500">
                                                                    <FaLock />
                                                                </InputLeftElement>
                                                                <Input
                                                                    name="otp"
                                                                    type="text"
                                                                    placeholder="Enter 6-digit OTP"
                                                                    value={loginData.otp}
                                                                    onChange={handleChange}
                                                                    bg={inputBg}
                                                                    borderColor="rgba(6,182,212,0.25)"
                                                                    focusBorderColor={focusBorderColor}
                                                                    maxLength={6}
                                                                />
                                                            </InputGroup>
                                                        </FormControl>
                                                    </GridItem>
                                                )}
                                            </>
                                        )}

                                        {isSignup && (
                                            <GridItem>
                                                <FormControl isRequired>
                                                    <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                                                        Email
                                                    </FormLabel>
                                                    <InputGroup>
                                                        <InputLeftElement pointerEvents="none" color="teal.500">
                                                            <FaEnvelope />
                                                        </InputLeftElement>
                                                        <Input
                                                            name="email"
                                                            type="email"
                                                            placeholder="patient@example.com"
                                                            value={signupData.email}
                                                            onChange={handleChange}
                                                            bg={inputBg}
                                                            borderColor="rgba(6,182,212,0.25)"
                                                            focusBorderColor={focusBorderColor}
                                                        />
                                                    </InputGroup>
                                                </FormControl>
                                            </GridItem>
                                        )}
                                    </SimpleGrid>

                                    <Flex
                                        w="full"
                                        justify="space-between"
                                        align={{ base: "flex-start", sm: "center" }}
                                        direction={{ base: "column", sm: "row" }}
                                        gap={3}
                                    >
                                    </Flex>

                                    <Button
                                        type="submit"
                                        w="full"
                                        bgGradient={PRIMARY_GRADIENT}
                                        color="white"
                                        size="lg"
                                        rounded="xl"
                                        isLoading={localLoading}
                                        boxShadow="0 18px 32px -18px rgba(6,182,212,0.55)"
                                        transition="all 0.2s ease"
                                        _hover={{
                                            bgGradient: "linear(to-r, #06B6D4, #0F4C75)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 22px 38px -16px rgba(6,182,212,0.6)",
                                        }}
                                    >
                                        {isSignup ? "Sign Up" : "Login"}
                                    </Button>
                                </VStack>
                            </form>

                            <Text textAlign="center" mt={6} color={PRIMARY_COLOR} fontSize="sm">
                                {isSignup ? (
                                    <>
                                        Already have an account?{" "}
                                        <Link
                                            color={accentLinkColor}
                                            fontWeight="bold"
                                            onClick={() => setIsSignup(false)}
                                            _hover={{ textDecoration: "underline" }}
                                        >
                                            Sign in here
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        New patient?{" "}
                                        <Link
                                            color={accentLinkColor}
                                            fontWeight="bold"
                                            onClick={() => setIsSignup(true)}
                                            _hover={{ textDecoration: "underline" }}
                                        >
                                            Create an account
                                        </Link>
                                    </>
                                )}
                            </Text>
                        </Box>

                        <Stack spacing={2} align="center" color={subtleText} fontSize="xs">
                            <HStack spacing={4}>
                                <Link color={accentLinkColor} href="#">
                                    Support
                                </Link>
                                <Text>•</Text>
                                <Link color={accentLinkColor} href="#">
                                    Privacy
                                </Link>
                                <Text>•</Text>
                                <Link color={accentLinkColor} href="#">
                                    Terms
                                </Link>
                            </HStack>
                            <HStack spacing={3}>
                                <Icon as={FaPhone} />
                                <Text>+1 (800) 555-0123</Text>
                            </HStack>
                            <Text>support@healthcare.com</Text>
                        </Stack>
                    </VStack>
                </Box>
            </Flex>

            {/* Forgot Password Modal */}
            <Modal isOpen={isOpen} onClose={() => {
                setForgotStep(1); setForgotEmail(""); setForgotToken(""); setNewPassword(""); onClose();
            }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color={PRIMARY_COLOR}>
                        {forgotStep === 1 ? "Forgot Password" : "Reset Password"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {forgotStep === 1 ? (
                            <form id="forgot-form" onSubmit={handleForgotPassword}>
                                <FormControl isRequired mb={4}>
                                    <FormLabel>Email address</FormLabel>
                                    <Input
                                        name="forgotEmail"
                                        type="email"
                                        placeholder="Your registered email"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                    />
                                </FormControl>
                            </form>
                        ) : (
                            <form id="reset-form" onSubmit={handleResetPassword}>
                                <FormControl isRequired mb={4}>
                                    <FormLabel>Token from your email</FormLabel>
                                    <Input
                                        name="forgotToken"
                                        placeholder="Paste the reset token here"
                                        value={forgotToken}
                                        onChange={e => setForgotToken(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl isRequired mb={4}>
                                    <FormLabel>New Password</FormLabel>
                                    <Input
                                        name="newPassword"
                                        type="password"
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                </FormControl>
                            </form>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => {
                            setForgotStep(1); setForgotEmail(""); setForgotToken(""); setNewPassword(""); onClose();
                        }}>
                            Cancel
                        </Button>
                        <Button
                            bgGradient={PRIMARY_GRADIENT}
                            color="white"
                            isLoading={resetLoading}
                            type="submit"
                            form={forgotStep === 1 ? "forgot-form" : "reset-form"}
                        >
                            {forgotStep === 1 ? "Send Reset Link" : "Reset Password"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default Login;
