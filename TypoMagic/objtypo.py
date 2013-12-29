#
# Typofinder for domain typo discovery
# 
# Released as open source by NCC Group Plc - http://www.nccgroup.com/
# 
# Developed by Ollie Whitehouse, ollie dot whitehouse at nccgroup dot com
#
# http://www.github.com/nccgroup/typofinder
#
# Released under AGPL see LICENSE for more information#
#

class objtypo:
    """typo object"""
    
    strDomain = ""
    strHost = ""
    bMX = False
    bTypo = False
    IPv4Address = []
    IPV6Address = []
    SafeBrowsing = ""
    wwwv4 = []
    wwwv6 = []
    mv4 = []
    mv6 = []
    webmailv4 = []
    webmailv6 = []
    aMX = []

    def __init__(self):
        self.strDomain = ""
        self.strHost = ""
        self.bMX = False
        self.bTypo = False
        self.IPv4Address = []
        self.IPV6Address = []
        self.SafeBrowsing = ""
        self.wwwv4 = []
        self.wwwv6 = []
        self.mv4 = []
        self.mv6 = []
        self.webmailv4 = []
        self.webmailv6 = []
        self.aMX = []

    # http://stackoverflow.com/questions/5160077/encoding-nested-python-object-in-json
    def reprJSON(self):
        return dict(strDomain=self.strDomain, strHost=self.strHost, bMX=self.bMX, bTypo=self.bTypo, IPv4Addresses=self.IPv4Address, IPv6Addresses=self.IPV6Address, SafeBrowsing = self.SafeBrowsing, wwwv4 = self.wwwv4, wwwv6 = self.wwwv6, mv4 = self.mv4, mv6 = self.mv6, webmailv4 = self.webmailv4, webmailv6 = self.webmailv6, aMX = self.aMX ) 
