'use client';

import React, { useState, useEffect } from "react";
import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Heading,
    Flex,
    Icon,
    Avatar,
    VStack,
    HStack,
    Divider,
    Button,
    useColorModeValue,
    Badge,
    Tag,
    Spinner,
    Center,
} from "@chakra-ui/react";
import {
    FaCalendarAlt,
    FaCalendarCheck,
    FaUserMd,
    FaFileMedical,
} from "react-icons/fa";
import {
    FiArrowRight,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";

const quickActions = [
    {
        label: "Book Appointment",
        helper: "Schedule a new visit",
        icon: FaCalendarCheck,
        accentColor: "#0F4C75",
        accentBg: "rgba(6, 182, 212, 0.15)",
    },
    {
        label: "View Doctors",
        helper: "See your healthcare providers",
        icon: FaUserMd,
        accentColor: "#14B8A6",
        accentBg: "rgba(20, 184, 166, 0.15)",
    },
    {
        label: "Medical Records",
        helper: "Access your health documents",
        icon: FaFileMedical,
        accentColor: "#0891B2",
        accentBg: "rgba(8, 145, 178, 0.15)",
    },
];

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalDoctors: 0,
        completedAppointments: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const cardBg = useColorModeValue("white", "gray.800");
    const cardShadow = useColorModeValue(
        "0 18px 35px rgba(15, 23, 42, 0.08)",
        "0 18px 35px rgba(0, 0, 0, 0.5)"
    );

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch stats and appointments in parallel
                const [statsResponse, appointmentsResponse] = await Promise.all([
                    import('../../../lib/api').then(api => api.patientApi.getDashboardStats()),
                    import('../../../lib/api').then(api => api.patientApi.getAppointments())
                ]);

                // Set stats
                if (statsResponse.data.success) {
                    setStats(statsResponse.data.data);
                }

                // Set upcoming appointments (filter from all appointments)
                if (appointmentsResponse.data.success) {
                    const allAppointments = appointmentsResponse.data.data;
                    const upcoming = allAppointments
                        .filter((apt: any) => {
                            const aptDate = new Date(apt.appointmentDate);
                            const now = new Date();
                            return aptDate >= now && apt.status !== 'Cancelled' && apt.status !== 'Completed';
                        })
                        .slice(0, 3) // Show only next 3
                        .map((apt: any) => ({
                            _id: apt._id,
                            doctorName: apt.doctorId?.name || 'Unknown Doctor',
                            specialty: apt.doctorId?.specialization || 'N/A',
                            date: new Date(apt.appointmentDate).toISOString().split('T')[0],
                            time: apt.slot?.start ? new Date(apt.slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD',
                            status: apt.status,
                        }));

                    setUpcomingAppointments(upcoming);
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statsData = [
        {
            label: "Upcoming Appointments",
            value: stats.upcomingAppointments,
            icon: FaCalendarAlt,
            change: "Next 7 days",
            subtext: "Scheduled visits",
        },
        {
            label: "My Doctors",
            value: stats.totalDoctors,
            icon: FaUserMd,
            change: "Healthcare providers",
            subtext: "In your network",
        },
        {
            label: "Completed Visits",
            value: stats.completedAppointments,
            icon: FaCalendarCheck,
            change: "This year",
            subtext: "Total appointments",
        },
    ];

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="400px">
                <VStack spacing={4}>
                    <Text color="red.500" fontSize="lg">{error}</Text>
                    <Button onClick={() => window.location.reload()} colorScheme="teal">
                        Retry
                    </Button>
                </VStack>
            </Center>
        );
    }

    return (
        <Box maxW="1200px" mx="auto">
            {/* Hero Section */}
            <Box
                position="relative"
                overflow="hidden"
                borderRadius="3xl"
                px={{ base: 6, md: 10 }}
                py={{ base: 8, md: 10 }}
                bgGradient="linear(to-r, teal.600, cyan.500)"
                color="white"
                mb={8}
            >
                <Box
                    position="absolute"
                    top="-10"
                    right="-10"
                    w="260px"
                    h="260px"
                    borderRadius="full"
                    bg="whiteAlpha.200"
                />
                <Flex
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "flex-start", md: "center" }}
                    gap={{ base: 6, md: 10 }}
                >
                    <Box>
                        <Text textTransform="uppercase" fontWeight="semibold" fontSize="xs" letterSpacing="wide">
                            Welcome back
                        </Text>
                        <Heading fontSize={{ base: "2xl", md: "3xl" }} mt={2} maxW="lg" lineHeight="1.3">
                            Your Health Dashboard
                        </Heading>
                        <Text mt={4} fontSize="sm" color="whiteAlpha.800" maxW="md">
                            Track your appointments, connect with doctors, and manage your health records all in one place.
                        </Text>
                        <HStack spacing={4} mt={6}>
                            <Button colorScheme="whiteAlpha" bg="white" color="teal.600" _hover={{ bg: "teal.50" }}>
                                Book Appointment
                            </Button>
                            <Button
                                variant="outline"
                                color="white"
                                borderColor="whiteAlpha.600"
                                _hover={{ bg: "whiteAlpha.200" }}
                            >
                                View Doctors
                            </Button>
                        </HStack>
                    </Box>
                    <Flex
                        direction="column"
                        bg="whiteAlpha.100"
                        borderRadius="2xl"
                        p={6}
                        minW={{ base: "full", md: "280px" }}
                        gap={4}
                    >
                        <Text fontSize="sm" color="whiteAlpha.700">
                            Today at a glance
                        </Text>
                        <Flex justify="space-between" align="center">
                            <Stat>
                                <StatLabel color="whiteAlpha.700">Next appointment</StatLabel>
                                <StatNumber fontSize="2xl">{stats.upcomingAppointments > 0 ? "Dec 28, 10:30 AM" : "No appointments"}</StatNumber>
                            </Stat>
                            <Icon as={FaCalendarCheck} boxSize={10} color="whiteAlpha.800" />
                        </Flex>
                        <Divider opacity={0.2} />
                        <HStack spacing={4}>
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="xs" color="whiteAlpha.700">
                                    Upcoming
                                </Text>
                                <Text fontWeight="semibold">{stats.upcomingAppointments}</Text>
                            </VStack>
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="xs" color="whiteAlpha.700">
                                    Completed
                                </Text>
                                <Text fontWeight="semibold">{stats.completedAppointments}</Text>
                            </VStack>
                        </HStack>
                    </Flex>
                </Flex>
            </Box>

            {/* Quick Actions */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} mb={8}>
                {quickActions.map((action) => (
                    <Box
                        key={action.label}
                        as="button"
                        textAlign="left"
                        p={5}
                        borderRadius="xl"
                        bg={cardBg}
                        boxShadow="0 1px 3px rgba(15, 23, 42, 0.12)"
                        _hover={{ transform: "translateY(-4px)", boxShadow: cardShadow }}
                        transition="all 0.25s ease"
                    >
                        <Flex align="center" justify="space-between">
                            <HStack spacing={3} align="flex-start">
                                <Flex
                                    w={10}
                                    h={10}
                                    borderRadius="full"
                                    align="center"
                                    justify="center"
                                    bg={action.accentBg}
                                    color={action.accentColor}
                                >
                                    <Icon as={action.icon} boxSize={5} />
                                </Flex>
                                <Box>
                                    <Text fontWeight="semibold" color="gray.800">
                                        {action.label}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        {action.helper}
                                    </Text>
                                </Box>
                            </HStack>
                            <Icon as={FiArrowRight} color="gray.400" />
                        </Flex>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                {statsData.map((stat) => (
                    <Box
                        key={stat.label}
                        bg={cardBg}
                        p={6}
                        borderRadius="2xl"
                        boxShadow={cardShadow}
                        transition="all 0.3s"
                        _hover={{ transform: "translateY(-6px)", boxShadow: "lg" }}
                    >
                        <Flex justify="space-between" align="center" mb={6}>
                            <Flex
                                w={12}
                                h={12}
                                borderRadius="full"
                                align="center"
                                justify="center"
                                bg="teal.50"
                                color="teal.600"
                            >
                                <Icon as={stat.icon} boxSize={6} />
                            </Flex>
                            <Badge
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="0.65rem"
                                colorScheme="teal"
                            >
                                {stat.change}
                            </Badge>
                        </Flex>
                        <Stat>
                            <StatLabel fontSize="sm" color="gray.500">
                                {stat.label}
                            </StatLabel>
                            <StatNumber fontSize="3xl" fontWeight="semibold" color="gray.800">
                                {stat.value}
                            </StatNumber>
                        </Stat>
                        <Text mt={3} fontSize="sm" color="gray.500">
                            {stat.subtext}
                        </Text>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Upcoming Appointments */}
            <Box p={6} bg={cardBg} borderRadius="2xl" boxShadow={cardShadow}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontSize="lg" fontWeight="600" color="teal.700">
                            Upcoming Appointments
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Your scheduled visits
                        </Text>
                    </Box>
                    <Button variant="ghost" size="sm" colorScheme="teal">
                        View all
                    </Button>
                </Flex>
                <VStack align="stretch" spacing={4}>
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt: any) => (
                        <Box
                            key={appt._id}
                            p={4}
                            borderRadius="xl"
                            bg="teal.50"
                            _hover={{ bg: "teal.100" }}
                            transition="all 0.2s ease"
                        >
                            <HStack align="flex-start" spacing={3}>
                                <Avatar name={appt.doctorName} src="" size="sm" />
                                <Box flex="1">
                                    <Text fontWeight="600" color="teal.800">
                                        {appt.doctorName}
                                    </Text>
                                    <Text fontSize="sm" color="teal.600">
                                        {appt.specialty}
                                    </Text>
                                    <Text fontSize="xs" color="teal.500" mt={1}>
                                        {appt.time}
                                    </Text>
                                </Box>
                                <VStack spacing={1} align="flex-end">
                                    <Text color="teal.600" fontWeight="600" fontSize="sm">
                                        {new Date(appt.date).toLocaleDateString()}
                                    </Text>
                                    <Tag size="sm" colorScheme={appt.status === "Confirmed" ? "green" : "orange"}>
                                        {appt.status}
                                    </Tag>
                                </VStack>
                            </HStack>
                        </Box>
                    )) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                            No upcoming appointments
                        </Text>
                    )}
                </VStack>
            </Box>
        </Box>
    );
}
