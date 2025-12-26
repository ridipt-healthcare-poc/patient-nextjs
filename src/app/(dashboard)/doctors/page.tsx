'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Heading,
    Text,
    useColorModeValue,
    SimpleGrid,
    VStack,
    HStack,
    Avatar,
    Badge,
    Button,
    Icon,
    Spinner,
    Center,
    useToast,
    Input,
    InputGroup,
    InputLeftElement,
} from "@chakra-ui/react";
import { FiSearch, FiPhone, FiMail, FiCalendar, FiArrowRight, FiUser } from "react-icons/fi";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const toast = useToast();
    const router = useRouter();

    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const api = await import('../../../lib/api');
            const response = await api.patientApi.getDoctors();
            if (response.data.success) {
                setDoctors(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast({
                title: 'Error',
                description: 'Failed to load doctors',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    return (
        <Box>
            <VStack align="flex-start" spacing={6} mb={8}>
                <Box>
                    <Heading fontSize="2xl" mb={2} color={useColorModeValue("teal.700", "teal.200")}>
                        My Doctors
                    </Heading>
                    <Text color="gray.500">
                        Healthcare providers you've visited or scheduled appointments with
                    </Text>
                </Box>

                <InputGroup maxW="md">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search by name or specialization..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg={cardBg}
                        borderRadius="xl"
                        borderWidth={1}
                        _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
                    />
                </InputGroup>
            </VStack>

            {filteredDoctors.length === 0 ? (
                <Box
                    p={12}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderRadius="2xl"
                    textAlign="center"
                    borderWidth={2}
                    borderStyle="dashed"
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                >
                    <Icon as={FiUser} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                        {searchQuery ? "No doctors found matching your search" : "No doctors found"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        {searchQuery ? "Try a different search term" : "Your doctors will appear here after you book an appointment"}
                    </Text>
                    {!searchQuery && (
                        <Button
                            mt={6}
                            colorScheme="teal"
                            leftIcon={<FiCalendar />}
                            onClick={() => router.push('/book-appointment')}
                        >
                            Find a Doctor
                        </Button>
                    )}
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredDoctors.map((doctor) => (
                        <Box
                            key={doctor._id}
                            bg={cardBg}
                            borderRadius="2xl"
                            borderWidth={1}
                            borderColor={borderColor}
                            p={6}
                            position="relative"
                            overflow="hidden"
                            transition="all 0.3s"
                            _hover={{
                                transform: "translateY(-4px)",
                                boxShadow: "xl",
                                borderColor: "teal.400"
                            }}
                        >
                            {/* Header: Avatar and Name */}
                            <VStack align="flex-start" spacing={4}>
                                <HStack spacing={4} w="full">
                                    <Avatar
                                        size="lg"
                                        name={doctor.name}
                                        src={doctor.profileImage}
                                        bg="teal.500"
                                        color="white"
                                    />
                                    <VStack align="flex-start" spacing={0}>
                                        <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                            {doctor.name}
                                        </Text>
                                        <Badge colorScheme="teal" borderRadius="full" px={2} py={0.5} fontSize="xs">
                                            {doctor.specialization}
                                        </Badge>
                                    </VStack>
                                </HStack>

                                <VStack align="flex-start" spacing={2} w="full">
                                    <HStack spacing={2} color="gray.500" fontSize="sm">
                                        <Icon as={FiMail} />
                                        <Text noOfLines={1}>{doctor.email || 'N/A'}</Text>
                                    </HStack>
                                    <HStack spacing={2} color="gray.500" fontSize="sm">
                                        <Icon as={FiPhone} />
                                        <Text>{doctor.phone || 'N/A'}</Text>
                                    </HStack>
                                </VStack>

                                <Box w="full" pt={4}>
                                    <Button
                                        w="full"
                                        colorScheme="teal"
                                        variant="outline"
                                        leftIcon={<FiCalendar />}
                                        size="sm"
                                        borderRadius="xl"
                                        onClick={() => router.push(`/book-appointment?doctorId=${doctor._id}&facilityId=${doctor.facilityId}`)}
                                        _hover={{ bg: "teal.500", color: "white" }}
                                    >
                                        Book Appointment
                                    </Button>
                                </Box>
                            </VStack>

                            {/* Accent Background */}
                            <Box
                                position="absolute"
                                top={0}
                                right={0}
                                p={2}
                                opacity={0.1}
                                color="teal.500"
                            >
                                <Icon as={FiUser} boxSize={20} position="absolute" top="-10px" right="-10px" />
                            </Box>
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}
