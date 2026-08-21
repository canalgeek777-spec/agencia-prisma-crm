import React from 'react';
import { supabase } from './supabaseClient';

const App = () => {
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setContacts(data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (newContact) => {
    const { error: insertError } = await supabase.from('contacts').insert([newContact]);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setError(null);
    fetchContacts();
  };

  return (
    <div className="App">
      <h1>CRM Application</h1>
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      <ContactForm onAddContact={addContact} />
      {loading ? <p>Carregando contatos...</p> : <ContactList contacts={contacts} />}
    </div>
  );
};

const ContactForm = ({ onAddContact }) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onAddContact({ name, email });
    setSubmitting(false);
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
      <button type="submit" disabled={submitting}>
        {submitting ? 'Adicionando...' : 'Add Contact'}
      </button>
    </form>
  );
};

const ContactList = ({ contacts }) => {
  if (contacts.length === 0) {
    return <p>Nenhum contato cadastrado ainda.</p>;
  }

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact.id}>
          {contact.name} - {contact.email}
        </li>
      ))}
    </ul>
  );
};

export default App;
