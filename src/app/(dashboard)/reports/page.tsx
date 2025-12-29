'use client';

import { Box, VStack, Heading, Text, Button, useToast, SimpleGrid, Card, CardBody, CardHeader, Icon, Flex, Badge, IconButton, Input, Select, Textarea, FormControl, FormLabel, Progress } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiUpload, FiFile, FiDownload, FiTrash2, FiFileText } from 'react-icons/fi';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface Report {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    reportType: string;
    reportDate: string;
    notes: string;
    uploadedAt: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [reportType, setReportType] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [notes, setNotes] = useState('');
    const toast = useToast();

    const reportTypes = [
        'Lab Report',
        'Prescription',
        'X-Ray',
        'MRI',
        'CT Scan',
        'Ultrasound',
        'Blood Test',
        'Other'
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('patientToken');
            const response = await axios.get(`${API_URL}/patient/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch reports',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: 'Invalid File Type',
                    description: 'Only PDF and Word documents are allowed',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: 'File Too Large',
                    description: 'Maximum file size is 10MB',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !reportType || !reportDate) {
            toast({
                title: 'Missing Information',
                description: 'Please select a file, report type, and date',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('reportFile', selectedFile);
        formData.append('reportType', reportType);
        formData.append('reportDate', reportDate);
        formData.append('notes', notes);

        try {
            const token = localStorage.getItem('patientToken');

            const response = await axios.post(`${API_URL}/patient/reports/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type - let axios set it with boundary
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                }
            });

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Report uploaded successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });

                // Reset form
                setSelectedFile(null);
                setReportType('');
                setReportDate('');
                setNotes('');
                setUploadProgress(0);

                // Refresh reports list
                fetchReports();
            }
        } catch (error: any) {
            toast({
                title: 'Upload Failed',
                description: error.response?.data?.message || 'Failed to upload report',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (reportId: string, fileName: string) => {
        try {
            const token = localStorage.getItem('patientToken');
            const response = await axios.get(`${API_URL}/patient/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const fileUrl = response.data.data.fileUrl;

                // Construct proper URL for local files
                const downloadUrl = fileUrl.startsWith('http')
                    ? fileUrl
                    : `http://localhost:8080${fileUrl}`;


                window.open(downloadUrl, '_blank');
            }
        } catch (error: any) {
            toast({
                title: 'Download Failed',
                description: error.response?.data?.message || 'Failed to download report',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (reportId: string) => {
        if (!confirm('Are you sure you want to delete this report?')) {
            return;
        }

        try {
            const token = localStorage.getItem('patientToken');
            const response = await axios.delete(`${API_URL}/patient/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Report deleted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });

                fetchReports();
            }
        } catch (error: any) {
            toast({
                title: 'Delete Failed',
                description: error.response?.data?.message || 'Failed to delete report',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        if (fileType === 'application/pdf') return FiFileText;
        return FiFile;
    };

    return (
        <Box p={8}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Box>
                    <Heading size="lg" mb={2}>Medical Reports</Heading>
                    <Text color="gray.600">Upload and manage your medical reports</Text>
                </Box>

                {/* Upload Section */}
                <Card
                    bg="white"
                    borderRadius="xl"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor="gray.200"
                >
                    <CardHeader
                        bgGradient="linear(to-r, blue.500, purple.500)"
                        borderTopRadius="xl"
                        py={4}
                    >
                        <Heading size="md" color="white">
                            <Icon as={FiUpload} mr={2} />
                            Upload New Report
                        </Heading>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Select File (PDF or Word)</FormLabel>
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    p={1}
                                />
                                {selectedFile && (
                                    <Text fontSize="sm" color="green.600" mt={2}>
                                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl>
                                <FormLabel>Report Type</FormLabel>
                                <Select
                                    placeholder="Select report type"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    {reportTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Report Date</FormLabel>
                                <Input
                                    type="date"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <Textarea
                                    placeholder="Add any notes about this report..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </FormControl>

                            {uploading && (
                                <Box>
                                    <Text fontSize="sm" mb={2}>Uploading... {uploadProgress}%</Text>
                                    <Progress value={uploadProgress} colorScheme="blue" />
                                </Box>
                            )}

                            <Button
                                colorScheme="blue"
                                size="lg"
                                leftIcon={<FiUpload />}
                                onClick={handleUpload}
                                isLoading={uploading}
                                isDisabled={!selectedFile || !reportType || !reportDate}
                            >
                                Upload Report
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Reports List */}
                <Box>
                    <Heading size="md" mb={4}>Your Reports ({reports.length})</Heading>

                    {loading ? (
                        <Text>Loading reports...</Text>
                    ) : reports.length === 0 ? (
                        <Card p={8} textAlign="center" bg="gray.50">
                            <Icon as={FiFileText} boxSize={12} color="gray.400" mx="auto" mb={4} />
                            <Text color="gray.600" fontSize="lg">No reports uploaded yet</Text>
                            <Text color="gray.500" fontSize="sm">Upload your first medical report above</Text>
                        </Card>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {reports.map((report) => (
                                <Card
                                    key={report._id}
                                    bg="white"
                                    borderRadius="lg"
                                    boxShadow="md"
                                    _hover={{ boxShadow: 'xl', transform: 'translateY(-2px)' }}
                                    transition="all 0.2s"
                                >
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <Flex align="center" justify="space-between">
                                                <Icon as={getFileIcon(report.fileType)} boxSize={8} color="blue.500" />
                                                <Badge colorScheme="purple">{report.reportType}</Badge>
                                            </Flex>

                                            <Box>
                                                <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                                    {report.fileName}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {new Date(report.reportDate).toLocaleDateString()}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {formatFileSize(report.fileSize)}
                                                </Text>
                                            </Box>

                                            {report.notes && (
                                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                    {report.notes}
                                                </Text>
                                            )}

                                            <Flex gap={2}>
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    leftIcon={<FiDownload />}
                                                    onClick={() => handleDownload(report._id, report.fileName)}
                                                    flex={1}
                                                >
                                                    Download
                                                </Button>
                                                <IconButton
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="outline"
                                                    icon={<FiTrash2 />}
                                                    aria-label="Delete report"
                                                    onClick={() => handleDelete(report._id)}
                                                />
                                            </Flex>

                                            <Text fontSize="xs" color="gray.400">
                                                Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </VStack>
        </Box>
    );
}
