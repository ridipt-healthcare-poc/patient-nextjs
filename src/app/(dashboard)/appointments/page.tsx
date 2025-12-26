'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Heading,
    Text,
    useColorModeValue,
    VStack,
    HStack,
    Badge,
    Avatar,
    Spinner,
    Center,
    Tag,
    Divider,
    useToast,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Portal,
} from "@chakra-ui/react";
import { FiCalendar, FiMapPin, FiMoreVertical, FiEye, FiX, FiPlus, FiClock } from "react-icons/fi";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const router = useRouter();
    const cardBg = useColorModeValue("white", "gray.800");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const api = await import('../../../lib/api');
            const response = await api.patientApi.getAppointments();
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast({
                title: 'Error',
                description: 'Failed to load appointments',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (appointmentId: string) => {
        router.push(`/appointments/${appointmentId}`);
    };

    const handleQuickCancel = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            const api = await import('../../../lib/api');
            await api.patientApi.cancelAppointment(appointmentId, 'Cancelled by patient');

            toast({
                title: 'Appointment Cancelled',
                description: 'Your appointment has been cancelled successfully',
                status: 'success',
                duration: 3000,
            });

            fetchAppointments();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to cancel appointment',
                status: 'error',
                duration: 3000,
            });
        }
    };

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'green';
            case 'Pending': return 'yellow';
            case 'Completed': return 'blue';
            case 'Cancelled': return 'red';
            default: return 'gray';
        }
    };

    const canCancelAppointment = (appointment: any) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const now = new Date();
        return appointmentDate > now && appointment.status !== 'Cancelled' && appointment.status !== 'Completed';
    };

    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return aptDate >= now && apt.status !== 'Cancelled' && apt.status !== 'Completed';
    });

    const pastAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return aptDate < now || apt.status === 'Cancelled' || apt.status === 'Completed';
    });

    const AppointmentCard = ({ appointment }: { appointment: any }) => (
        <Box
            position="relative"
            overflow="hidden"
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth={1}
            borderColor={useColorModeValue("gray.200", "gray.700")}
            _hover={{
                boxShadow: "xl",
                transform: "translateY(-4px)",
                borderColor: "teal.400"
            }}
            transition="all 0.3s"
            cursor="pointer"
            onClick={() => handleViewDetails(appointment._id)}
        >
            {/* Colored accent bar */}
            <Box
                position="absolute"
                left={0}
                top={0}
                bottom={0}
                width="6px"
                bg={
                    appointment.status === 'Confirmed' ? 'green.500' :
                        appointment.status === 'Pending' ? 'yellow.500' :
                            appointment.status === 'Completed' ? 'blue.500' :
                                'red.500'
                }
            />

            <HStack p={6} spacing={6} align="flex-start">
                <Avatar
                    name={appointment.doctorId?.name || 'Doctor'}
                    size="lg"
                    bg="teal.500"
                    color="white"
                />

                <VStack align="flex-start" spacing={3} flex={1}>
                    <Box>
                        <Text fontWeight="bold" fontSize="lg" color={useColorModeValue("gray.800", "white")}>
                            {appointment.doctorId?.name || 'Unknown Doctor'}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {appointment.doctorId?.specialization || 'General'}
                        </Text>
                    </Box>

                    <HStack spacing={6} flexWrap="wrap">
                        <HStack spacing={2}>
                            <Icon as={FiCalendar} color="teal.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="medium">
                                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </HStack>

                        {appointment.slot?.start && (
                            <HStack spacing={2}>
                                <Icon as={FiClock} color="teal.500" boxSize={4} />
                                <Text fontSize="sm" fontWeight="medium">
                                    {new Date(appointment.slot.start).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </HStack>
                        )}

                        <HStack spacing={2}>
                            <Icon as={FiMapPin} color="purple.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="medium" color="purple.600">
                                {appointment.facilityId?.name || 'Facility'}
                            </Text>
                        </HStack>
                    </HStack>

                    {appointment.reasonForVisit && (
                        <Box
                            p={3}
                            bg={useColorModeValue("gray.50", "gray.700")}
                            borderRadius="lg"
                            width="full"
                        >
                            <Text fontSize="xs" color="gray.500" mb={1} fontWeight="semibold">
                                REASON FOR VISIT
                            </Text>
                            <Text fontSize="sm" color="gray.700">
                                {appointment.reasonForVisit}
                            </Text>
                        </Box>
                    )}
                </VStack>

                <VStack spacing={3} align="flex-end">
                    <Tag
                        size="lg"
                        colorScheme={getStatusColor(appointment.status)}
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontWeight="semibold"
                    >
                        {appointment.status}
                    </Tag>

                    <Menu isLazy>
                        <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
                        />
                        <Portal>
                            <MenuList zIndex={1500} boxShadow="xl">
                                <MenuItem icon={<FiEye />} onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(appointment._id);
                                }}>
                                    View Details
                                </MenuItem>
                                {canCancelAppointment(appointment) && (
                                    <MenuItem
                                        icon={<FiX />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickCancel(appointment._id);
                                        }}
                                        color="red.500"
                                    >
                                        Cancel Appointment
                                    </MenuItem>
                                )}
                            </MenuList>
                        </Portal>
                    </Menu>
                </VStack>
            </HStack>
        </Box>
    );

    return (
        <Box>
            <HStack justify="space-between" mb={6}>
                <Box>
                    <Heading fontSize="2xl" mb={2} color={useColorModeValue("teal.700", "teal.200")}>
                        My Appointments
                    </Heading>
                    <Text color="gray.500">
                        All your appointments across all facilities
                    </Text>
                </Box>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="teal"
                    onClick={() => router.push('/book-appointment')}
                    size="md"
                >
                    Book Appointment
                </Button>
            </HStack>

            <Tabs colorScheme="teal" variant="soft-rounded">
                <TabList mb={6}>
                    <Tab px={6}>Upcoming ({upcomingAppointments.length})</Tab>
                    <Tab px={6}>Past ({pastAppointments.length})</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0}>
                        {upcomingAppointments.length === 0 ? (
                            <Box
                                p={12}
                                bg={useColorModeValue("gray.50", "gray.700")}
                                borderRadius="2xl"
                                textAlign="center"
                                borderWidth={2}
                                borderStyle="dashed"
                                borderColor={useColorModeValue("gray.300", "gray.600")}
                            >
                                <Icon as={FiCalendar} boxSize={12} color="gray.400" mb={4} />
                                <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                                    No upcoming appointments
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    Click "Book Appointment" to schedule a new visit
                                </Text>
                            </Box>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                {upcomingAppointments.map((appointment) => (
                                    <AppointmentCard key={appointment._id} appointment={appointment} />
                                ))}
                            </VStack>
                        )}
                    </TabPanel>

                    <TabPanel p={0}>
                        {pastAppointments.length === 0 ? (
                            <Box
                                p={12}
                                bg={useColorModeValue("gray.50", "gray.700")}
                                borderRadius="2xl"
                                textAlign="center"
                                borderWidth={2}
                                borderStyle="dashed"
                                borderColor={useColorModeValue("gray.300", "gray.600")}
                            >
                                <Icon as={FiCalendar} boxSize={12} color="gray.400" mb={4} />
                                <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                                    No past appointments
                                </Text>
                            </Box>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                {pastAppointments.map((appointment) => (
                                    <AppointmentCard key={appointment._id} appointment={appointment} />
                                ))}
                            </VStack>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}
