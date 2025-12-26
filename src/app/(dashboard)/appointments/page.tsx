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
} from "@chakra-ui/react";
import { FiCalendar, FiMapPin, FiMoreVertical, FiEye, FiX } from "react-icons/fi";

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

    return (
        <Box>
            <Heading fontSize="2xl" mb={2} color={useColorModeValue("teal.700", "teal.200")}>
                My Appointments
            </Heading>
            <Text color="gray.500" mb={6}>
                All your appointments across all facilities
            </Text>

            {appointments.length === 0 ? (
                <Box
                    p={8}
                    bg={useColorModeValue("teal.50", "gray.700")}
                    borderRadius="xl"
                    textAlign="center"
                >
                    <Text fontSize="lg" color="gray.600">
                        No appointments found
                    </Text>
                </Box>
            ) : (
                <VStack spacing={4} align="stretch">
                    {appointments.map((appointment) => (
                        <Box
                            key={appointment._id}
                            p={6}
                            bg={cardBg}
                            borderRadius="xl"
                            boxShadow="md"
                            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => handleViewDetails(appointment._id)}
                        >
                            <HStack justify="space-between" align="flex-start" spacing={4}>
                                <HStack spacing={4} flex={1}>
                                    <Avatar
                                        name={appointment.doctorId?.name || 'Doctor'}
                                        size="md"
                                    />
                                    <VStack align="flex-start" spacing={1} flex={1}>
                                        <Text fontWeight="bold" fontSize="lg">
                                            {appointment.doctorId?.name || 'Unknown Doctor'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            {appointment.doctorId?.specialization || 'General'}
                                        </Text>

                                        {/* Facility Badge */}
                                        <HStack spacing={2} mt={2}>
                                            <Badge colorScheme="purple" fontSize="xs">
                                                <HStack spacing={1}>
                                                    <FiMapPin size={10} />
                                                    <Text>{appointment.facilityId?.name || 'Facility'}</Text>
                                                </HStack>
                                            </Badge>
                                        </HStack>
                                    </VStack>
                                </HStack>

                                <VStack align="flex-end" spacing={2}>
                                    <HStack>
                                        <Tag colorScheme={getStatusColor(appointment.status)} size="md">
                                            {appointment.status}
                                        </Tag>
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                icon={<FiMoreVertical />}
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <MenuList>
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
                                        </Menu>
                                    </HStack>
                                    <HStack spacing={1} color="gray.600">
                                        <FiCalendar />
                                        <Text fontSize="sm">
                                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                                        </Text>
                                    </HStack>
                                    {appointment.slot?.start && (
                                        <Text fontSize="sm" color="gray.600">
                                            {new Date(appointment.slot.start).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>

                            {appointment.notes && (
                                <>
                                    <Divider my={3} />
                                    <Text fontSize="sm" color="gray.600">
                                        <strong>Notes:</strong> {appointment.notes}
                                    </Text>
                                </>
                            )}
                        </Box>
                    ))}
                </VStack>
            )}
        </Box>
    );
}
