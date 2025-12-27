'use client'

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    VStack,
    HStack,
    Icon,
    Spinner,
    useToast,
    Badge,
    useColorModeValue,
    Avatar,
    Button,
    Divider,
} from '@chakra-ui/react';
import { FaHospital, FaClinicMedical, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendar, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { patientApi } from '@/lib/api';

interface Address {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

interface Facility {
    _id: string;
    name: string;
    address: Address | string;
    phone: string;
    email: string;
    facilityType: string;
    registeredAt: string;
}

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const router = useRouter();

    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headingColor = useColorModeValue("teal.700", "teal.200");
    const emptyStateBg = useColorModeValue("gray.50", "gray.700");
    const emptyStateBorder = useColorModeValue("gray.300", "gray.600");
    const iconBg = useColorModeValue("teal.50", "teal.900");

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const response = await patientApi.getFacilities();
            setFacilities(response.data.data);
        } catch (error: any) {
            toast({
                title: 'Error fetching facilities',
                description: error.response?.data?.message || 'Failed to load facilities',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address: Address | string): string => {
        if (typeof address === 'string') return address;

        const parts = [
            address.street,
            address.city,
            address.state,
            address.pincode,
            address.country
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : 'No address provided';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Center minH="400px">
                <Spinner size="xl" color="teal.500" thickness="4px" />
            </Center>
        );
    }

    return (
        <Box>
            <VStack align="flex-start" spacing={2} mb={8}>
                <Heading fontSize="2xl" color={headingColor}>
                    My Registered Facilities
                </Heading>
                <Text color="gray.500">
                    Your healthcare network - view and manage your registered hospitals and clinics
                </Text>
            </VStack>

            {facilities.length === 0 ? (
                <Box
                    p={12}
                    bg={emptyStateBg}
                    borderRadius="2xl"
                    textAlign="center"
                    borderWidth={2}
                    borderStyle="dashed"
                    borderColor={emptyStateBorder}
                >
                    <Icon as={FaHospital} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                        No facilities found
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Register at a facility to start your healthcare journey
                    </Text>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {facilities.map((facility) => (
                        <Box
                            key={facility._id}
                            position="relative"
                            overflow="hidden"
                            bg={cardBg}
                            borderRadius="2xl"
                            borderWidth={1}
                            borderColor={borderColor}
                            p={6}
                            transition="all 0.3s"
                            _hover={{
                                transform: "translateY(-4px)",
                                boxShadow: "xl",
                                borderColor: "teal.400"
                            }}
                        >
                            {/* Colored accent bar */}
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                width="6px"
                                bg="teal.500"
                            />

                            <VStack align="stretch" spacing={5}>
                                <HStack justify="space-between" align="flex-start">
                                    <HStack spacing={4}>
                                        <Box
                                            p={3}
                                            borderRadius="xl"
                                            bg={iconBg}
                                            color="teal.500"
                                        >
                                            <Icon
                                                as={facility.facilityType === 'Hospital' ? FaHospital : FaClinicMedical}
                                                boxSize={6}
                                            />
                                        </Box>
                                        <VStack align="flex-start" spacing={0}>
                                            <Heading size="md" noOfLines={1}>{facility.name}</Heading>
                                            <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2}>
                                                {facility.facilityType}
                                            </Badge>
                                        </VStack>
                                    </HStack>
                                </HStack>

                                <VStack align="flex-start" spacing={3}>
                                    <HStack color="gray.600" align="flex-start">
                                        <Icon as={FaMapMarkerAlt} mt={1} color="teal.500" />
                                        <Text fontSize="sm" noOfLines={2}>{formatAddress(facility.address)}</Text>
                                    </HStack>

                                    <SimpleGrid columns={2} spacing={4} w="full">
                                        <HStack color="gray.600">
                                            <Icon as={FaPhone} color="teal.500" />
                                            <Text fontSize="sm">{facility.phone || 'N/A'}</Text>
                                        </HStack>
                                        <HStack color="gray.600">
                                            <Icon as={FaEnvelope} color="teal.500" />
                                            <Text fontSize="sm" noOfLines={1}>{facility.email || 'N/A'}</Text>
                                        </HStack>
                                    </SimpleGrid>
                                </VStack>

                                <Divider />

                                <HStack justify="space-between">
                                    <HStack spacing={2} color="gray.400">
                                        <Icon as={FaCalendar} size="xs" />
                                        <Text fontSize="xs">
                                            Joined {formatDate(facility.registeredAt)}
                                        </Text>
                                    </HStack>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="teal"
                                        rightIcon={<FaArrowRight />}
                                        onClick={() => router.push(`/book-appointment?facilityId=${facility._id}`)}
                                    >
                                        Book Now
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}

// Add missing Center component from chakra
import { Center } from '@chakra-ui/react';
