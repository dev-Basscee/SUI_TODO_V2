import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink } from "lucide-react";

interface WalletNotInstalledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletNotInstalledDialog({ open, onOpenChange }: WalletNotInstalledDialogProps) {
  const wallets = [
    {
      name: "Sui Wallet",
      url: "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
      description: "Official Sui Wallet by Mysten Labs"
    },
    {
      name: "Ethos Wallet",
      url: "https://chrome.google.com/webstore/detail/ethos-sui-wallet/mcbigmjiafegjnnogedioegffbooigli",
      description: "User-friendly Sui wallet"
    },
    {
      name: "Suiet Wallet",
      url: "https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd",
      description: "Open-source Sui wallet"
    }
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              🦀
            </div>
            Sui Wallet Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            To use this Todo List dApp, you need to install a Sui wallet. Choose one of the recommended wallets below:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 my-4">
          {wallets.map((wallet) => (
            <a
              key={wallet.name}
              href={wallet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
            >
              <div>
                <div className="font-medium text-sm">{wallet.name}</div>
                <div className="text-xs text-muted-foreground">{wallet.description}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            </a>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            I'll install a wallet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}