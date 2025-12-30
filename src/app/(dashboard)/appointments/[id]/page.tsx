'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Badge,
    Avatar,
    Spinner,
    Center,
    Button,
    Divider,
    useColorModeValue,
    useToast,
    Textarea,
    FormControl,
    FormLabel,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { FiArrowLeft, FiCalendar, FiMapPin, FiClock, FiUser, FiPhone, FiMail } from "react-icons/fi";
import PrescriptionCard from "@/components/PrescriptionCard";

export default function AppointmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // All hooks must be at the top
    const cardBg = useColorModeValue("white", "gray.800");
    const headingColor = useColorModeValue("teal.700", "teal.200");

    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancellationReason, setCancellationReason] = useState('');
    const [prescription, setPrescription] = useState<any>(null);
    const [loadingPrescription, setLoadingPrescription] = useState(false);

    useEffect(() => {
        fetchAppointmentDetails();
    }, [params.id]);

    useEffect(() => {
        if (appointment?.prescriptionId) {
            fetchPrescription();
        }
    }, [appointment]);

    const fetchAppointmentDetails = async () => {
        try {
            const api = await import('../../../../lib/api');
            const response = await api.patientApi.getAppointmentById(params.id as string);
            if (response.data.success) {
                setAppointment(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
            toast({
                title: 'Error',
                description: 'Failed to load appointment details',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPrescription = async () => {
        if (!appointment?.prescriptionId) return;

        setLoadingPrescription(true);
        try {
            const api = await import('../../../../lib/api');
            const response = await api.patientApi.getPrescriptionById(appointment.prescriptionId);
            if (response.data.success) {
                setPrescription(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching prescription:', error);
        } finally {
            setLoadingPrescription(false);
        }
    };

    const handleCancelAppointment = async () => {
        try {
            const api = await import('../../../../lib/api');
            await api.patientApi.cancelAppointment(params.id as string, cancellationReason);

            toast({
                title: 'Appointment Cancelled',
                description: 'Your appointment has been cancelled successfully',
                status: 'success',
                duration: 3000,
            });

            onClose();
            router.push('/appointments');
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

    if (!appointment) {
        return (
            <Box>
                <Text>Appointment not found</Text>
                <Button mt={4} onClick={() => router.push('/appointments')}>
                    Back to Appointments
                </Button>
            </Box>
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

    const canCancelAppointment = () => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const now = new Date();
        return appointmentDate > now && appointment.status !== 'Cancelled' && appointment.status !== 'Completed';
    };

    return (
        <Box maxW="800px" mx="auto">
            {/* Header */}
            <HStack mb={6}>
                <Button
                    leftIcon={<FiArrowLeft />}
                    variant="ghost"
                    onClick={() => router.push('/appointments')}
                >
                    Back
                </Button>
            </HStack>

            <Heading fontSize="2xl" mb={6} color={headingColor}>
                Appointment Details
            </Heading>

            {/* Main Card */}
            <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg">
                {/* Status Badge */}
                <HStack justify="space-between" mb={6}>
                    <Badge colorScheme={getStatusColor(appointment.status)} fontSize="md" px={3} py={1}>
                        {appointment.status}
                    </Badge>
                    {canCancelAppointment() && (
                        <Button colorScheme="red" size="sm" onClick={onOpen}>
                            Cancel Appointment
                        </Button>
                    )}
                </HStack>

                <VStack align="stretch" spacing={6}>
                    {/* Doctor Information */}
                    <Box>
                        <Text fontSize="sm" color="gray.500" mb={2}>DOCTOR</Text>
                        <HStack spacing={4}>
                            <Avatar
                                name={appointment.doctorId?.name}
                                size="lg"
                            />
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="xl" fontWeight="bold">
                                    {appointment.doctorId?.name || 'Unknown Doctor'}
                                </Text>
                                <Text color="gray.600">
                                    {appointment.doctorId?.specialization || 'General'}
                                </Text>
                                {appointment.doctorId?.phone && (
                                    <HStack spacing={2} fontSize="sm" color="gray.600">
                                        <FiPhone size={14} />
                                        <Text>{appointment.doctorId.phone}</Text>
                                    </HStack>
                                )}
                            </VStack>
                        </HStack>
                    </Box>

                    <Divider />

                    {/* Facility Information */}
                    <Box>
                        <Text fontSize="sm" color="gray.500" mb={2}>FACILITY</Text>
                        <VStack align="flex-start" spacing={2}>
                            <HStack>
                                <FiMapPin />
                                <Text fontWeight="semibold" fontSize="lg">
                                    {appointment.facilityId?.name || 'Facility'}
                                </Text>
                            </HStack>
                            {appointment.facilityId?.address && (
                                <Text color="gray.600" pl={6}>
                                    {appointment.facilityId.address.street}, {appointment.facilityId.address.city}
                                    {appointment.facilityId.address.state && `, ${appointment.facilityId.address.state}`}
                                    {appointment.facilityId.address.zipCode && ` - ${appointment.facilityId.address.zipCode}`}
                                </Text>
                            )}
                            {appointment.facilityId?.phone && (
                                <HStack spacing={2} color="gray.600" pl={6}>
                                    <FiPhone size={14} />
                                    <Text>{appointment.facilityId.phone}</Text>
                                </HStack>
                            )}
                        </VStack>
                    </Box>

                    <Divider />

                    {/* Date & Time */}
                    <Box>
                        <Text fontSize="sm" color="gray.500" mb={2}>DATE & TIME</Text>
                        <VStack align="flex-start" spacing={2}>
                            <HStack>
                                <FiCalendar />
                                <Text fontSize="lg" fontWeight="semibold">
                                    {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </HStack>
                            {appointment.slot?.start && (
                                <HStack pl={6} color="gray.600">
                                    <FiClock />
                                    <Text>
                                        {new Date(appointment.slot.start).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} - {new Date(appointment.slot.end).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </HStack>
                            )}
                        </VStack>
                    </Box>

                    {/* Appointment Type */}
                    {appointment.appointmentType && (
                        <>
                            <Divider />
                            <Box>
                                <Text fontSize="sm" color="gray.500" mb={2}>TYPE</Text>
                                <Badge colorScheme="blue">{appointment.appointmentType}</Badge>
                            </Box>
                        </>
                    )}

                    {/* Notes */}
                    {appointment.notes && (
                        <>
                            <Divider />
                            <Box>
                                <Text fontSize="sm" color="gray.500" mb={2}>NOTES</Text>
                                <Text color="gray.700">{appointment.notes}</Text>
                            </Box>
                        </>
                    )}

                    {/* Cancellation Reason (if cancelled) */}
                    {appointment.status === 'Cancelled' && appointment.cancellationReason && (
                        <>
                            <Divider />
                            <Box>
                                <Text fontSize="sm" color="gray.500" mb={2}>CANCELLATION REASON</Text>
                                <Text color="red.600">{appointment.cancellationReason}</Text>
                            </Box>
                        </>
                    )}
                </VStack>
            </Box>

            {/* Prescription Section */}
            {(appointment.status === 'Confirmed' || appointment.status === 'Completed') && (
                <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg" mt={6}>
                    <VStack align="stretch" spacing={4}>
                        <Text fontSize="sm" color="gray.500">PRESCRIPTION</Text>
                        <Divider />

                        {loadingPrescription ? (
                            <Center py={8}>
                                <Spinner size="lg" color="teal.500" />
                            </Center>
                        ) : prescription ? (
                            <PrescriptionCard prescription={prescription} />
                        ) : (
                            <Text color="gray.500" textAlign="center" py={8}>
                                No prescription issued yet for this appointment.
                            </Text>
                        )}
                    </VStack>
                </Box>
            )}

            {/* Cancel Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Cancel Appointment
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Text mb={4}>
                                Are you sure you want to cancel this appointment with{' '}
                                <strong>{appointment.doctorId?.name}</strong>?
                            </Text>
                            <FormControl>
                                <FormLabel>Reason for Cancellation (Optional)</FormLabel>
                                <Textarea
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Please provide a reason..."
                                />
                            </FormControl>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Keep Appointment
                            </Button>
                            <Button colorScheme="red" onClick={handleCancelAppointment} ml={3}>
                                Cancel Appointment
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
