package com.covoiturage.covoiturage.Service;


import com.covoiturage.covoiturage.Entite.LigneCMD;
import com.covoiturage.covoiturage.repository.LigneCMDRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LigneCMDService {

    @Autowired
    private LigneCMDRepository ligneCMDRepository;

    public List<LigneCMD> getAllLignesCommande() {
        return ligneCMDRepository.findAll();
    }

    public Optional<LigneCMD> getLigneCommandeById(Long id) {
        return ligneCMDRepository.findById(id);
    }

    public List<LigneCMD> getLignesCommandeByCommande(Long commandeId) {
        return ligneCMDRepository.findByCommandeId(commandeId);
    }

    public LigneCMD saveLigneCommande(LigneCMD ligneCMD) {
        return ligneCMDRepository.save(ligneCMD);
    }

    public void deleteLigneCommande(Long id) {
        ligneCMDRepository.deleteById(id);
    }
}
