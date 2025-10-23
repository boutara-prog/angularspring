package com.covoiturage.covoiturage.Service;


import com.covoiturage.covoiturage.Entite.Client;
import com.covoiturage.covoiturage.Entite.Fournisseur;
import com.covoiturage.covoiturage.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Client saveClient(Client client) {
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    public Optional<Client> getClientByEmail(String email) {

        return clientRepository.findByEmail(email);
    }
    public List<Client> searchClients(String searchTerm) {
        return clientRepository.findBySearchTerm(searchTerm);
    }

}
