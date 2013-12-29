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

import argparse
import sys
import time
import socket
import http.server
import urllib
import traceback
import re
import dns.resolver
from os import curdir, sep
from socketserver import ThreadingMixIn
from dns.resolver import NoNameservers
import json
import typogen
import hostinfo
from objtypo import objtypo
import safebrowsing

_hostinfo = hostinfo.hostinfo()

# v2 AJAX API
def handleHostAJAX(sDomain):
    typo = objtypo()
    
    typo.strDomain = sDomain
    
    try:
        for hostData in _hostinfo.getIPv4(sDomain):
            typo.IPv4Address.append(hostData.address)
    except:
        pass

    try:
        for hostData in _hostinfo.getIPv6(sDomain):
            typo.IPv6Address.append(hostData.address)
    except:
        pass

    try:
        for hostData in _hostinfo.getMX(sDomain):
            typo.aMX.append(str(hostData.exchange).strip("."))
    except:
        pass

    #try:
    #    typo.IPv6Address = _hostinfo.getIPv6(sDomain)
    #    print(typo.IPv6Address)
    #except:
    #    pass

    #try:
    #    typo.webmailv4 = _hostinfo.getWEBMail(sDomain)
    #    print(typo.webmailv4 )
    #except:
    #    pass

    #try:
    #    typo.webmailv6 = _hostinfo.getWEBMailv6(sDomain)
    #    print(typo.webmailv6)
    #except:
    #    pass

    #try:
    #    typo.aMX = _hostinfo.getMX(sDomain)
    #    print(typo.aMX )
    #except:
    #    pass
        
    return typo


# v1 non AJAX API
def handleHost(sHostname, http_handler, bMX, bTypo):
    
    if bMX:
        http_handler.output("--- [host] MX Host ")
    elif bTypo:
        http_handler.output("[host] Typo Host ")
    else:
        http_handler.output("[host] Host ")
    
    http_handler.output(sHostname)

    try:
        IPv4 = _hostinfo.getIPv4(sHostname)
    except:
        IPv4 = None

    try:
       IPv6 = _hostinfo.getIPv6(sHostname)
    except:
       IPv6 = None 

    # Only display results about the domain's web site if it resolves and we aren't processing an MX record
    if (IPv4 or IPv6) and not bMX:
        http_handler.output(" " + safebrowsing.safebrowsingquery(sHostname))

    http_handler.output("<br/>")

    if IPv4 is None and IPv6 is None:
       if bMX:
           http_handler.output("---")
       http_handler.output("--- [host] No IPv6 or IPv4 address<br/>")
     
    if IPv4 is not None:
        for hostData in IPv4:
            if bMX:
                http_handler.output("---")
            http_handler.output("--- [host IPv4] A: " + hostData.address + " from " + sHostname + " ")
            #print(_hostinfo.getGeoImagebyIP(hostData.address))
            #print(_hostinfo.getGeoImagebyHostname(sHostname))
            strFlag = _hostinfo.getGeoImagebyIP(hostData.address)
            http_handler.output(strFlag + "<br/>")
    
    if IPv6 is not None:
        for hostData in IPv6:  
            if bMX:
                http_handler.output("---")
            http_handler.output("--- [host IPv6] AAAA: " +hostData.address + " from " + sHostname + " ")
            #print(_hostinfo.getGeoImagebyIP(hostData.address))
            #_hostinfo.getGeoImagebyIP(hostData.address) 
            strFlag = _hostinfo.getGeoImagebyIPv6(hostData.address)
            http_handler.output(strFlag + "<br/>")

    if not bMX:
        try:
            IPMX = _hostinfo.getMX(sHostname)
        except NoNameservers:
            IPMX = None
        
        if IPMX is not None:
            for hostData in IPMX:
                #print(hostData.exchange)
                http_handler.output("--- [host MX] for " + sHostname + " is " + str(hostData.exchange).strip(".") + "<br/>")
                handleHost(str(hostData.exchange).strip("."),http_handler,True, bTypo)
        else:
            http_handler.output("--- [host] No MX records<br/>")

    # www v4
    try:
        IPWWW = _hostinfo.getWWW(sHostname)
    except:
        IPWWW = None

    if IPWWW is not None:
        for hostData in IPWWW:  
            if not bMX:
                http_handler.output("--- [www. IPv4] A: " +hostData.address + " from " + sHostname + " ")
                strFlag = _hostinfo.getGeoImagebyIP(hostData.address)
                http_handler.output(strFlag + "<br/>")

    # www v6
    try:
        IPWWW = _hostinfo.getWWWv6(sHostname)
    except:
        IPWWW = None

    if IPWWW is not None:
        for hostData in IPWWW:  
            if not bMX:
                http_handler.output("--- [www. IPv6] A: " +hostData.address + " from " + sHostname + " ")
                strFlag = _hostinfo.getGeoImagebyIPv6(hostData.address)
                http_handler.output(strFlag + "<br/>")

    # webmail v4
    try:
        IPWebMail= _hostinfo.getWEBMail(sHostname)
    except:
        IPWebMail = None

    if IPWebMail is not None:
        for hostData in IPWebMail:
            if not bMX:
                http_handler.output("--- [webmail. IPv4] A: " +hostData.address + " from " + sHostname + " ")
                strFlag = _hostinfo.getGeoImagebyIP(hostData.address)
                http_handler.output(strFlag + "<br/>")

    # webmail v6
    try:
        IPWebMail= _hostinfo.getWEBMailv6(sHostname)
    except:
        IPWebMail = None

    if IPWebMail is not None:
        for hostData in IPWebMail:
            if not bMX:
                http_handler.output("--- [webmail. IPv6] A: " +hostData.address + " from " + sHostname + " ")
                strFlag = _hostinfo.getGeoImagebyIPv6(hostData.address)
                http_handler.output(strFlag + "<br/>")

    # m v4
    try:
        IPM= _hostinfo.getM(sHostname)
    except:
        IPM = None
    
    if IPM is not None:
        for hostData in IPM:  
            if not bMX:
                http_handler.output("--- [m. IPv4] A: " +hostData.address + " from " + sHostname + " ")
                strFlag = _hostinfo.getGeoImagebyIP(hostData.address)
                http_handler.output(strFlag + "<br/>")

    # m v6
    try:
        IPM= _hostinfo.getMv6(sHostname)
    except:
        IPM = None
    
    if IPM is not None:
        for hostData in IPM:  
            if not bMX:
                http_handler.output("--- [m. IPv6] A: " +hostData.address + " from " + sHostname + " ")
                strFlag = _hostinfo.getGeoImagebyIPv6(hostData.address)
                http_handler.output(strFlag + "<br/>")

    # if we're not a typo (i.e. we're the base domain) then mutate
    if bTypo == False and bMX == False:
        # this could be a different country if you supplied the map
        lstTypos = typogen.typogen.generatetypos(sHostname,"GB")
        if lstTypos is not None:
            for strTypoHost in lstTypos:
                handleHost(strTypoHost,http_handler,False,True)
                                   
    # WHOIS TODO
    #domain = whois.query('zemes.com')
    #print(domain)

    return

class MyHandler(http.server.BaseHTTPRequestHandler):

    def output(self, outputString):
        self.wfile.write(outputString.encode('utf-8'))

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_POST(self):
        """Respond to a POST request."""

        try:
            # legacy API from v1
            if self.path.endswith("typo.ncc"):
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.output("<html><head>")
                self.output("<title>NCC Typo Finder Results</title>")
                self.output("<link rel=\"stylesheet\" type=\"text/css\" href=\"/css/oldstyle.css\">")
                self.output("</head>")
                self.output("Released under AGPL by <a href=\"http://www.nccgroup.com/\">NCC Group</a> - source available <a href=\"https://github.com/nccgroup/typofinder\">here</a><br/>")
        

                length = int(self.headers['Content-Length'])
                post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
        
                strHost = str(post_data['host'])[2:-2]
                if re.match('^[a-zA-Z0-9.-]+$',strHost): 
                    handleHost(strHost,self,False,False)
            
            # v2 AJAX API
            elif self.path.endswith("typov2.ncc"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
       
                length = int(self.headers['Content-Length'])
                post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
                print("[i] " + str(post_data))
                strHost = str(post_data['host'])[2:-2]
                if re.match('^[a-zA-Z0-9.-]+$',strHost):
                    print("[i] Processing typos for " + strHost) 
                    lstTypos = typogen.typogen.generatetypos(strHost,"GB")
                    if lstTypos is not None:
                        self.output(json.dumps([strTypoHost for strTypoHost in lstTypos]))
                    else:
                        self.output("[!] No typos for " + strHost)   
                    print("[i] Processed typos for " + strHost)   

            # v2 AJAX API      
            elif self.path.endswith("entity.ncc"):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                
                length = int(self.headers['Content-Length'])
                post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
                strHost = str(post_data['host'])[2:-2]
                try:
                    objFoo = handleHostAJAX(strHost)
                    self.output(json.dumps(objFoo.reprJSON()))
                except dns.resolver.NXDOMAIN:
                    pass
        except:
            print(sys.exc_info())
            traceback.print_exc(file=sys.stdout)
            pass
              
        return

    def do_GET(self):
        """Respond to a GET request."""

        try:
            if self.path.endswith("/"):
                f = open(curdir + sep + "index.html") 
                self.send_response(200)
                self.send_header('Content-type','text/html')
                self.end_headers()
                self.output(f.read())
                f.close()
                return
            elif self.path.endswith(".html") and self.path.find("..") != 0:
                f = open(curdir + sep + self.path) 
                self.send_response(200)
                self.send_header('Content-type','text/html')
                self.end_headers()
                self.output(f.read())
                f.close()
                return
            elif self.path.endswith(".css") and self.path.find("..") != 0:
                f = open(curdir + sep + self.path) 
                self.send_response(200)
                self.send_header('Content-type','text/css')
                self.end_headers()
                self.output(f.read())
                f.close()
                return
            elif self.path.endswith(".js") and self.path.find("..") != 0:
                f = open(curdir + sep + self.path) 
                self.send_response(200)
                self.send_header('Content-type','application/javascript')
                self.end_headers()
                self.wfile.write(bytes(f.read(), 'UTF-8'))
                f.close()
                return
            elif self.path.endswith(".png") and self.path.find("..") != 0:
                f = open(curdir + sep + self.path, "rb") 
                self.send_response(200)
                self.send_header('Content-type','image/png')
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
                return
            else:
               self.send_error(404,'[!] File Not Found: %s' % self.path)

        except IOError:
            self.send_error(404,'[!] File Not Found: %s' % self.path)

        except:
            pass

class MultiThreadedHTTPServer(ThreadingMixIn, http.server.HTTPServer):
    pass

def tcpport(parameter):
    """
    Callable for converting valid TCP port number Strings into ints.

    @param parameter: The string representation of the TCP port number.
    @return: The int representation of the TCP port number if it's valid.
    @raise argparse.ArgumentTypeError: If the given value is invalid.
    """
    try:
        int_param = int(parameter)
    except ValueError:
        raise argparse.ArgumentTypeError("Port number needs to be an integer")
    if not int_param in range(1, 65536):
        raise argparse.ArgumentTypeError("Port number needs to be between 1 and 65535")
    return int_param

if __name__ == '__main__':
    
    print ("[i] NCC Group domain typofinder - https://github.com/nccgroup")

    parser = argparse.ArgumentParser()
    parser.add_argument('-p','--port', help='Port to listen on',required=False, type=tcpport, default=801)
    parser.add_argument('-a','--address', help='hostname / IP address to bind to',required=False, type=str, default='')
    #TODO: complete implementation...
    #parser.add_argument('-k','--key',help='Google SafeBrowsing API key', required=False)
    args = parser.parse_args()

    try:   
        httpd = MultiThreadedHTTPServer((args.address, args.port), MyHandler)
    except socket.gaierror:
        print("[!] Supplied address invalid! exiting!")
        sys.exit()

    print ("[i]", time.asctime(), " Server Starts - %s:%s" % (args.address, args.port))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    
    httpd.server_close()
    print ("[i]", time.asctime(), " Server Stops - %s:%s" % (args.address, args.port))
