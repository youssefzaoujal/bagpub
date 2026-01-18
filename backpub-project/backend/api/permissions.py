from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Vérifie si l'utilisateur est un administrateur"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsClient(permissions.BasePermission):
    """Vérifie si l'utilisateur est un client"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'
    
    def has_object_permission(self, request, view, obj):
        """Vérifie que l'utilisateur est propriétaire de l'objet"""
        if hasattr(obj, 'client'):
            return obj.client == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'campaign'):
            return obj.campaign.client == request.user
        return False

class IsPartner(permissions.BasePermission):
    """Vérifie si l'utilisateur est un partenaire"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'partner'

class IsClientOrAdmin(permissions.BasePermission):
    """Vérifie si l'utilisateur est un client OU un admin"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['client', 'admin']

class IsOwnerOrAdmin(permissions.BasePermission):
    """Vérifie si l'utilisateur est le propriétaire OU un admin"""
    
    def has_object_permission(self, request, view, obj):
        # Si admin, autorisé
        if request.user.role == 'admin':
            return True
        
        # Si client, vérifier qu'il est propriétaire
        if request.user.role == 'client':
            # Pour les campagnes
            if hasattr(obj, 'client'):
                return obj.client == request.user
            # Pour les designs
            elif hasattr(obj, 'campaign'):
                return obj.campaign.client == request.user
        
        return False
