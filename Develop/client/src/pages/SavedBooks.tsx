import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Fetch user data using Apollo Client
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};

  // Set up the remove book mutation
  const [removeBook] = useMutation(REMOVE_BOOK);

  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // Remove book ID from localStorage upon success
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // If data isn't here yet, show loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
<>
  <div className="bg-dark text-light py-5">
    <Container>
      <h1 className="display-4 text-center">
        {userData.username
          ? `Viewing ${userData.username}'s saved books!`
          : 'Viewing saved books!'}
      </h1>
    </Container>
  </div>

  <Container className="my-5">
    <h2 className="text-center">
      {userData.savedBooks.length
        ? `You have ${userData.savedBooks.length} saved ${
            userData.savedBooks.length === 1 ? 'book' : 'books'
          }!`
        : 'You have no saved books!'}
    </h2>

    <Row className="mt-4">
      {userData.savedBooks.map((book) => (
        <Col md={4} key={book.bookId} className="mb-4">
          <Card className="h-100 shadow-sm border-dark">
            {book.image ? (
              <Card.Img
                src={book.image}
                alt={`Cover of ${book.title}`}
                className="card-img-top"
              />
            ) : null}

            <Card.Body className="d-flex flex-column">
              <Card.Title className="text-center mb-3">{book.title}</Card.Title>
              <p className="text-muted small text-center">Authors: {book.authors}</p>
              <Card.Text className="flex-grow-1">{book.description}</Card.Text>
              <Button
                variant="danger"
                className="mt-3"
                onClick={() => handleDeleteBook(book.bookId)}
                block
              >
                Delete this Book
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
</>
  );
};

export default SavedBooks;