'use client';

import {
    Box,
    Button,
    Badge,
    VStack,
    HStack,
    Text,
    useToast,
    useColorModeValue,
    Divider,
} from '@chakra-ui/react';
import { FiFileText, FiDownload } from 'react-icons/fi';

interface PrescriptionCardProps {
    prescription: any;
}

export default function PrescriptionCard({ prescription }: PrescriptionCardProps) {
    const toast = useToast();
    const cardBg = useColorModeValue('white', 'gray.800');
    const labelColor = useColorModeValue('gray.600', 'gray.400');

    const getStatusColor = (status: string) => {
        return status === 'issued' ? 'green' : 'gray';
    };

    const handleDownload = () => {
        if (!prescription?.fileUrl) {
            toast({
                title: 'Download failed',
                description: 'File URL not available',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // For file downloads, use base URL without /api
        const BASE_URL = 'http://localhost:8080';
        const fileUrl = prescription.fileUrl.startsWith('http')
            ? prescription.fileUrl
            : `${BASE_URL}${prescription.fileUrl}`;

        window.open(fileUrl, '_blank');
    };

    return (
        <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
            <VStack align="stretch" spacing={4}>
                {/* Header */}
                <HStack justify="space-between">
                    <HStack>
                        <FiFileText size={24} color="teal" />
                        <Text fontWeight="bold" fontSize="lg">
                            Prescription
                        </Text>
                    </HStack>
                    <Badge colorScheme={getStatusColor(prescription.status)} fontSize="sm">
                        {prescription.status?.toUpperCase()}
                    </Badge>
                </HStack>

                <Divider />

                {/* Prescription Info */}
                <Box>
                    <Text fontSize="sm" color={labelColor} mb={1}>
                        Issued on
                    </Text>
                    <Text fontWeight="medium">
                        {new Date(prescription.issuedAt || prescription.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </Box>

                {/* Type */}
                <Box>
                    <Text fontSize="sm" color={labelColor} mb={1}>
                        Type
                    </Text>
                    <Badge colorScheme="purple" fontSize="sm">
                        {prescription.prescriptionType === 'uploaded' ? 'Uploaded File' : 'Generated Prescription'}
                    </Badge>
                </Box>

                {/* Doctor Info */}
                {prescription.doctorId && (
                    <Box>
                        <Text fontSize="sm" color={labelColor} mb={1}>
                            Prescribed by
                        </Text>
                        <Text fontWeight="medium">
                            Dr. {prescription.doctorId.name}
                        </Text>
                        {prescription.doctorId.specialization && (
                            <Text fontSize="sm" color={labelColor}>
                                {prescription.doctorId.specialization}
                            </Text>
                        )}
                    </Box>
                )}

                {/* Generated Prescription Details */}
                {prescription.prescriptionType === 'generated' && (
                    <>
                        {prescription.diagnosis && (
                            <Box>
                                <Text fontSize="sm" color={labelColor} mb={1}>
                                    Diagnosis
                                </Text>
                                <Text fontWeight="medium">{prescription.diagnosis}</Text>
                            </Box>
                        )}

                        {prescription.medications && prescription.medications.length > 0 && (
                            <Box>
                                <Text fontSize="sm" color={labelColor} mb={2}>
                                    Medications ({prescription.medications.length})
                                </Text>
                                <VStack align="stretch" spacing={2}>
                                    {prescription.medications.slice(0, 3).map((med: any, index: number) => (
                                        <Box
                                            key={index}
                                            p={3}
                                            bg={useColorModeValue('teal.50', 'gray.700')}
                                            borderRadius="md"
                                            fontSize="sm"
                                        >
                                            <Text fontWeight="semibold">{med.name}</Text>
                                            <Text fontSize="xs" color={labelColor}>
                                                {med.dosage} • {med.frequency} • {med.duration}
                                            </Text>
                                            {med.instructions && (
                                                <Text fontSize="xs" color={labelColor} mt={1}>
                                                    {med.instructions}
                                                </Text>
                                            )}
                                        </Box>
                                    ))}
                                    {prescription.medications.length > 3 && (
                                        <Text fontSize="xs" color={labelColor} fontStyle="italic">
                                            +{prescription.medications.length - 3} more medications
                                        </Text>
                                    )}
                                </VStack>
                            </Box>
                        )}

                        {prescription.followUpDate && (
                            <Box>
                                <Text fontSize="sm" color={labelColor} mb={1}>
                                    Follow-up Date
                                </Text>
                                <Text fontWeight="medium">
                                    {new Date(prescription.followUpDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </Box>
                        )}
                    </>
                )}

                {/* Notes */}
                {prescription.notes && (
                    <Box>
                        <Text fontSize="sm" color={labelColor} mb={1}>
                            Notes
                        </Text>
                        <Text fontSize="sm">{prescription.notes}</Text>
                    </Box>
                )}

                <Divider />

                {/* Download Button */}
                <Button
                    colorScheme="teal"
                    leftIcon={<FiDownload />}
                    onClick={handleDownload}
                    w="full"
                >
                    Download Prescription
                </Button>
            </VStack>
        </Box>
    );
}
