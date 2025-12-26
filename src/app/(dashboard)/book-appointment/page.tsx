'use client'

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Button,
    Select,
    FormControl,
    FormLabel,
    Textarea,
    useToast,
    Card,
    CardBody,
    Text,
    SimpleGrid,
    Badge,
    Icon,
    Radio,
    RadioGroup,
    Stack,
    Spinner,
} from '@chakra-ui/react';
import { FaHospital, FaUserMd, FaCalendar, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { patientApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Facility {
    _id: string;
    name: string;
    facilityType: string;
}

interface Doctor {
    _id: string;
    name: string;
    specialization: string;
    department?: string;
    consultationFees?: {
        onsite?: number;
        voiceCall?: number;
        videoCall?: number;
        homeVisit?: number;
    };
}

interface TimeSlot {
    _id: string;
    dayOfWeek: string;
    start: { hour: number; minute: number };
    end: { hour: number; minute: number };
}

export default function BookAppointmentPage() {
    const router = useRouter();
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form data
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [selectedFacilityType, setSelectedFacilityType] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [appointmentType, setAppointmentType] = useState('onsite');
    const [reasonForVisit, setReasonForVisit] = useState('');

    useEffect(() => {
        fetchFacilities();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const doctorId = queryParams.get('doctorId');
        const facilityId = queryParams.get('facilityId');

        const autoSetup = async () => {
            if (facilityId && facilities.length > 0) {
                // Use the existing handleFacilityChange to ensure consistency (fetching doctors, etc.)
                await handleFacilityChange(facilityId);

                // If doctorId is also provided, pre-select them
                if (doctorId) {
                    // Doctors list should be populated now because handleFacilityChange is awaited
                    setSelectedDoctor(doctorId);
                }

                // Always stay on Step 1 as requested, so the user can see/confirm selections
                setStep(1);
            }
        };

        if (facilities.length > 0 && (facilityId || doctorId)) {
            autoSetup();
        }
    }, [facilities]);

    const handleDoctorPreSelect = async (doctorId: string) => {
        try {
            // We need to find which facility this doctor belongs to
            // This is a bit complex without knowing the facilityId first
            // For now, let's just log it. In a real app, we'd fetch the doctor details first.
            console.log('Pre-selecting doctor:', doctorId);
        } catch (error) {
            console.error('Error pre-selecting doctor:', error);
        }
    };

    const fetchFacilities = async () => {
        try {
            const response = await patientApi.getFacilities();
            setFacilities(response.data.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load facilities',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleFacilityChange = async (facilityId: string) => {
        setSelectedFacility(facilityId);
        const facility = facilities.find(f => f._id === facilityId);
        setSelectedFacilityType(facility?.facilityType || '');
        setSelectedDoctor('');
        setDoctors([]);
        setSlots([]);
        setSelectedSlot(null);

        if (facilityId) {
            setLoading(true);
            try {
                const response = await patientApi.getDoctorsByFacility(facilityId);
                setDoctors(response.data.data);
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: 'Failed to load doctors',
                    status: 'error',
                    duration: 3000,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDateChange = async (date: string) => {
        setAppointmentDate(date);
        setSelectedSlot(null);
        setSlots([]);

        if (date && selectedDoctor) {
            setLoading(true);
            try {
                const response = await patientApi.getDoctorSlots(selectedDoctor, date);
                setSlots(response.data.data.slots);
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: 'Failed to load available slots',
                    status: 'error',
                    duration: 3000,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const formatTime = (time: { hour: number; minute: number }) => {
        const hour = time.hour > 12 ? time.hour - 12 : time.hour;
        const period = time.hour >= 12 ? 'PM' : 'AM';
        const minute = time.minute.toString().padStart(2, '0');
        return `${hour}:${minute} ${period}`;
    };

    const handleSubmit = async () => {
        if (!selectedFacility || !selectedDoctor || !appointmentDate || !selectedSlot) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all required fields',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const date = new Date(appointmentDate);
            const startTime = new Date(date);
            startTime.setHours(selectedSlot.start.hour, selectedSlot.start.minute, 0, 0);
            const endTime = new Date(date);
            endTime.setHours(selectedSlot.end.hour, selectedSlot.end.minute, 0, 0);

            const appointmentData = {
                facilityId: selectedFacility,
                facilityType: selectedFacilityType,
                doctorId: selectedDoctor,
                appointmentDate: appointmentDate,
                appointmentType,
                reasonForVisit,
                slot: {
                    start: startTime.toISOString(),
                    end: endTime.toISOString(),
                },
            };

            await patientApi.createAppointment(appointmentData);
            toast({
                title: 'Success!',
                description: 'Appointment booked successfully',
                status: 'success',
                duration: 3000,
            });
            router.push('/appointments');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to book appointment',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedDoctorDetails = doctors.find(d => d._id === selectedDoctor);
    const consultationFee = selectedDoctorDetails?.consultationFees?.[appointmentType as keyof typeof selectedDoctorDetails.consultationFees] || 0;

    return (
        <Container maxW="container.lg" py={8}>
            <VStack align="stretch" spacing={6}>
                <HStack justify="space-between">
                    <Heading size="lg">Book Appointment</Heading>
                    <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
                        Step {step} of 3
                    </Badge>
                </HStack>

                {/* Step 1: Select Facility & Doctor */}
                {step === 1 && (
                    <Card>
                        <CardBody>
                            <VStack align="stretch" spacing={6}>
                                <HStack>
                                    <Icon as={FaHospital} color="teal.500" boxSize={6} />
                                    <Heading size="md">Select Facility & Doctor</Heading>
                                </HStack>

                                <FormControl isRequired>
                                    <FormLabel>Facility</FormLabel>
                                    <Select
                                        placeholder="Select facility"
                                        value={selectedFacility}
                                        onChange={(e) => handleFacilityChange(e.target.value)}
                                    >
                                        {facilities.map((facility) => (
                                            <option key={facility._id} value={facility._id}>
                                                {facility.name} ({facility.facilityType})
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                {loading && (
                                    <Box textAlign="center" py={4}>
                                        <Spinner color="teal.500" />
                                        <Text mt={2}>Loading doctors...</Text>
                                    </Box>
                                )}

                                {!loading && doctors.length > 0 && (
                                    <FormControl isRequired>
                                        <FormLabel>Doctor</FormLabel>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            {doctors.map((doctor) => (
                                                <Card
                                                    key={doctor._id}
                                                    variant={selectedDoctor === doctor._id ? 'filled' : 'outline'}
                                                    cursor="pointer"
                                                    onClick={() => setSelectedDoctor(doctor._id)}
                                                    borderColor={selectedDoctor === doctor._id ? 'teal.500' : 'gray.200'}
                                                    borderWidth={2}
                                                    _hover={{ borderColor: 'teal.300' }}
                                                >
                                                    <CardBody>
                                                        <VStack align="start" spacing={1}>
                                                            <HStack>
                                                                <Icon as={FaUserMd} color="teal.500" />
                                                                <Text fontWeight="bold">{doctor.name}</Text>
                                                            </HStack>
                                                            <Text fontSize="sm" color="gray.600">
                                                                {doctor.specialization}
                                                            </Text>
                                                            {doctor.department && (
                                                                <Badge colorScheme="blue">{doctor.department}</Badge>
                                                            )}
                                                        </VStack>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </SimpleGrid>
                                    </FormControl>
                                )}

                                <HStack justify="flex-end">
                                    <Button
                                        rightIcon={<FaArrowRight />}
                                        colorScheme="teal"
                                        onClick={() => setStep(2)}
                                        isDisabled={!selectedFacility || !selectedDoctor}
                                    >
                                        Next
                                    </Button>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                )}

                {/* Step 2: Select Date & Time */}
                {step === 2 && (
                    <Card>
                        <CardBody>
                            <VStack align="stretch" spacing={6}>
                                <HStack>
                                    <Icon as={FaCalendar} color="teal.500" boxSize={6} />
                                    <Heading size="md">Select Date & Time</Heading>
                                </HStack>

                                <FormControl isRequired>
                                    <FormLabel>Appointment Type</FormLabel>
                                    <RadioGroup value={appointmentType} onChange={setAppointmentType}>
                                        <Stack direction="column" spacing={3}>
                                            <Radio value="onsite">On-site Visit</Radio>
                                            <Radio value="voiceCall">Voice Call</Radio>
                                            <Radio value="videoCall">Video Call</Radio>
                                            <Radio value="homeVisit">Home Visit</Radio>
                                        </Stack>
                                    </RadioGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Date</FormLabel>
                                    <input
                                        type="date"
                                        value={appointmentDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #E2E8F0',
                                        }}
                                    />
                                </FormControl>

                                {loading && appointmentDate && (
                                    <Box textAlign="center" py={4}>
                                        <Spinner color="teal.500" />
                                        <Text mt={2}>Loading available slots...</Text>
                                    </Box>
                                )}

                                {!loading && slots.length > 0 && (
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="semibold" fontSize="md">
                                            Available Time Slots
                                        </FormLabel>
                                        <Text fontSize="sm" color="gray.600" mb={3}>
                                            Select a time slot for your appointment
                                        </Text>
                                        <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing={3}>
                                            {slots.map((slot) => (
                                                <Button
                                                    key={slot._id}
                                                    variant={selectedSlot?._id === slot._id ? 'solid' : 'outline'}
                                                    colorScheme={selectedSlot?._id === slot._id ? 'teal' : 'gray'}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    size="md"
                                                    height="50px"
                                                    borderWidth={2}
                                                    borderColor={selectedSlot?._id === slot._id ? 'teal.500' : 'gray.200'}
                                                    _hover={{
                                                        borderColor: 'teal.400',
                                                        transform: 'translateY(-2px)',
                                                        shadow: 'md',
                                                    }}
                                                    transition="all 0.2s"
                                                    fontWeight="semibold"
                                                >
                                                    <VStack spacing={0}>
                                                        <Icon as={FaCalendar} boxSize={3} mb={1} />
                                                        <Text fontSize="sm">{formatTime(slot.start)}</Text>
                                                    </VStack>
                                                </Button>
                                            ))}
                                        </SimpleGrid>
                                        <Text fontSize="xs" color="gray.500" mt={2}>
                                            {slots.length} slot{slots.length !== 1 ? 's' : ''} available
                                        </Text>
                                    </FormControl>
                                )}

                                {!loading && appointmentDate && slots.length === 0 && (
                                    <Box
                                        p={6}
                                        borderRadius="lg"
                                        bg="gray.50"
                                        borderWidth={1}
                                        borderColor="gray.200"
                                        textAlign="center"
                                    >
                                        <Icon as={FaCalendar} boxSize={8} color="gray.400" mb={2} />
                                        <Text color="gray.600" fontWeight="medium">
                                            No available slots for this date
                                        </Text>
                                        <Text fontSize="sm" color="gray.500" mt={1}>
                                            Please try selecting a different date
                                        </Text>
                                    </Box>
                                )}

                                <FormControl>
                                    <FormLabel>Reason for Visit</FormLabel>
                                    <Textarea
                                        value={reasonForVisit}
                                        onChange={(e) => setReasonForVisit(e.target.value)}
                                        placeholder="Describe your symptoms or reason for visit"
                                        rows={4}
                                    />
                                </FormControl>

                                <HStack justify="space-between">
                                    <Button leftIcon={<FaArrowLeft />} onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button
                                        rightIcon={<FaArrowRight />}
                                        colorScheme="teal"
                                        onClick={() => setStep(3)}
                                        isDisabled={!appointmentDate || !selectedSlot}
                                    >
                                        Review
                                    </Button>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                )}

                {/* Step 3: Review & Confirm */}
                {step === 3 && (
                    <Card>
                        <CardBody>
                            <VStack align="stretch" spacing={6}>
                                <Heading size="md">Review Appointment</Heading>

                                <VStack align="stretch" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" mb={1}>Facility</Text>
                                        <Text>{facilities.find(f => f._id === selectedFacility)?.name}</Text>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" mb={1}>Doctor</Text>
                                        <Text>{selectedDoctorDetails?.name}</Text>
                                        <Text fontSize="sm" color="gray.600">{selectedDoctorDetails?.specialization}</Text>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" mb={1}>Date & Time</Text>
                                        <Text>{new Date(appointmentDate).toLocaleDateString()} at {selectedSlot && formatTime(selectedSlot.start)}</Text>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" mb={1}>Appointment Type</Text>
                                        <Badge colorScheme="teal">{appointmentType}</Badge>
                                    </Box>

                                    {consultationFee > 0 && (
                                        <Box>
                                            <Text fontWeight="bold" mb={1}>Consultation Fee</Text>
                                            <Text fontSize="xl" color="teal.600">₹{consultationFee}</Text>
                                        </Box>
                                    )}

                                    {reasonForVisit && (
                                        <Box>
                                            <Text fontWeight="bold" mb={1}>Reason for Visit</Text>
                                            <Text>{reasonForVisit}</Text>
                                        </Box>
                                    )}
                                </VStack>

                                <HStack justify="space-between">
                                    <Button leftIcon={<FaArrowLeft />} onClick={() => setStep(2)}>
                                        Back
                                    </Button>
                                    <Button
                                        colorScheme="teal"
                                        onClick={handleSubmit}
                                        isLoading={loading}
                                        loadingText="Booking..."
                                    >
                                        Confirm Booking
                                    </Button>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                )}
            </VStack>
        </Container>
    );
}
