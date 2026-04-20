import React from 'react';

const App = () => {
    const [contacts, setContacts] = React.useState([]);

    const addContact = (newContact) => {
        setContacts([...contacts, newContact]);
    };

    return (
        <div className="App">
            <h1>CRM Application</h1>
            <ContactForm onAddContact={addContact} />
            <ContactList contacts={contacts} />
        </div>
    );
};

const ContactForm = ({ onAddContact }) => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddContact({ name, email });
        setName('');
        setEmail('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit">Add Contact</button>
        </form>
    );
};

const ContactList = ({ contacts }) => {
    return (
        <ul>
            {contacts.map((contact, index) => (
                <li key={index}>{contact.name} - {contact.email}</li>
            ))}
        </ul>
    );
};

export default App;