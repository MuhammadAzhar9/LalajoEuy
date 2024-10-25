import React, { useState, useEffect } from "react";
import { Container, Table, Form, Button, Modal, Pagination, Dropdown, Col } from 'react-bootstrap';
import { FaPlus } from "react-icons/fa";
import "./InputCountry.css";

const CountryManager = () => {
    const [countries, setCountries] = useState([]);
    const [newCountry, setNewCountry] = useState("");
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true); // To handle loading state
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const [searchTerm, setSearchTerm] = useState(""); // State untuk menyimpan input pencarian
    const [showCount, setShowCount] = useState(10); // Items per page

    const handleShowModal = () => setShowModal(true);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('http://localhost:8001/countries');
                const data = await response.json();
                setCountries(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching countries:", error);
                setLoading(false);
            }
        };
        fetchCountries();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setNewCountry("");
    };

    const handleAddCountry = async () => {
        const trimmedCountry = newCountry.trim();

        if (trimmedCountry) {
            if (countries.some(country => country.country_name.toLowerCase() === trimmedCountry.toLowerCase())) {
                alert("Country already exists!");
            } else {
                try {
                    const response = await fetch('http://localhost:8001/countries', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ country_name: trimmedCountry }),
                    });

                    const data = await response.json();
                    setCountries([...countries, data]);
                    setNewCountry("");
                    handleCloseModal();
                } catch (error) {
                    console.error("Error adding country:", error);
                }
            }
        } else {
            alert("Country name cannot be empty or just spaces!");
        }
    };


    const handleDeleteCountry = async (id) => {
        try {
            await fetch(`http://localhost:8001/countries/${id}`, {
                method: 'DELETE',
            });
            setCountries(countries.filter((country) => country.id !== id));
        } catch (error) {
            console.error("Error deleting country:", error);
        }
    };

    const handleRenameCountry = async (id) => {
        if (editName.trim()) {
            try {
                await fetch(`http://localhost:8001/countries/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ country_name: editName }),
                });
                setCountries(
                    countries.map((country) =>
                        country.id === id ? { ...country, country_name: editName } : country
                    )
                );
                setEditing(null);
                setEditName("");
            } catch (error) {
                console.error("Error updating country:", error);
            }
        }
    };

    // Function untuk filter drama berdasarkan search term (sebelum pagination)
    const filteredCountries = countries.filter((country) =>
        country.country_name && country.country_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCountry = currentPage * showCount;
    const indexOfFirstCountry = indexOfLastCountry - showCount;
    const currentCountries = filteredCountries.slice(indexOfFirstCountry, indexOfLastCountry); // Paginate hasil pencarian
    const totalPages = Math.ceil(filteredCountries.length / showCount);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Logic to show only 3 pages (current, previous, next)
    const renderPagination = () => {
        let items = [];
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>
            );
        }
        return (
            <div className="d-flex justify-content-end">
                <Pagination>
                    <Pagination.First onClick={() => setCurrentPage(1)} />
                    <Pagination.Prev onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)} />
                    {items}
                    <Pagination.Next onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} />
                </Pagination>
            </div>
        );
    };


    return (
        <Container>
            <Container className="App">
                <h1 className="title">Country Manager</h1>
            </Container>
            {/* Form Section */}
            <Container className="list-drama-header d-flex justify-content-between mb-3">
                <Container className="d-flex">
                    <Col xs="auto" className="d-flex me-3">
                        <Dropdown onSelect={setShowCount}>
                            <Dropdown.Toggle variant="light" id="dropdown-show">
                                Shows: {showCount}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {[10, 20, 50].map((count) => (
                                    <Dropdown.Item key={count} eventKey={count}>
                                        {count}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Container>

                {/* Button to Add New Country */}
                <Button
                    variant="success"
                    className="d-flex align-items-center w-auto px-4 py-2"
                    style={{ whiteSpace: 'nowrap' }} // Ini mencegah teks tombol pecah ke baris lain
                    onClick={handleShowModal}>
                    <FaPlus className="me-2" />
                    Add New Country
                </Button>
            </Container>
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Country</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                value={newCountry}
                                onChange={(e) => setNewCountry(e.target.value)}
                                placeholder="Enter country name"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        className="mt-2"
                        onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="mt-2"
                        onClick={handleAddCountry}
                        style={{ backgroundColor: '#ff5722', borderColor: '#ff5722' }}
                    >
                        Add Country
                    </Button>
                </Modal.Footer>
            </Modal>


            {loading ? (
                <p>Loading data...</p>
            ) : (
                <>
                    {/* Table Section */}
                    <Container className="country-table-wrapper">
                        <Table className="country-table" striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Country</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCountries.map((country) => (
                                    <tr key={country.id}>
                                        <td>{country.id}</td>
                                        <td>
                                            {editing === country.id ? (
                                                <Form.Control
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                            ) : (
                                                country.country_name
                                            )}
                                        </td>
                                        <td>
                                            {editing === country.id ? (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleRenameCountry(country.id)}
                                                        className="me-2"
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setEditing(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Container className="action-button">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => {
                                                            setEditing(country.id);
                                                            setEditName(country.country_name);
                                                        }}
                                                        disabled={editing !== null}
                                                    >
                                                        Rename
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleDeleteCountry(country.id)}
                                                        disabled={editing !== null}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Container>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Container>
                    {renderPagination()}
                </>
            )}
        </Container >
    );
};

export default CountryManager;
