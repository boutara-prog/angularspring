package com.covoiturage.covoiturage.Service;


import com.covoiturage.covoiturage.Entite.User;

public interface EmailService {
    void sendVerificationEmail(User user);
}
