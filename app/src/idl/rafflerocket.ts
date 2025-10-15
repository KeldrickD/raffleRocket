import { IDL as RaffleRocketIDL } from './types';
import { Program } from '@project-serum/anchor';

export type RaffleRocketProgram = Program<typeof RaffleRocketIDL>;
export const IDL = RaffleRocketIDL;

export type RaffleRocket = {
  "version": "0.1.0",
  "name": "rafflerocket",
  "instructions": [
    {
      "name": "initializeRaffle",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "jackpot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "ticketCap",
          "type": "u32"
        },
        {
          "name": "duration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "buyTicket",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "jackpot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "quantity",
          "type": "u32"
        },
        {
          "name": "paymentAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endRaffle",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "jackpot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "enableVrf",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "raffle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "ticketCap",
            "type": "u32"
          },
          {
            "name": "ticketsSold",
            "type": "u32"
          },
          {
            "name": "totalEntries",
            "type": "u32"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "endTimestamp",
            "type": "i64"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "nftTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "entries",
            "type": {
              "vec": {
                "defined": "RaffleEntry"
              }
            }
          },
          {
            "name": "isVrfEnabled",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "jackpot",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalLamports",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "buyerStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "totalTickets",
            "type": "u32"
          },
          {
            "name": "totalEntries",
            "type": "u32"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "totalWon",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RaffleEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "entries",
            "type": "u32"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TicketCapReached",
      "msg": "Ticket cap has been reached"
    },
    {
      "code": 6001,
      "name": "RaffleEnded",
      "msg": "Raffle has ended"
    },
    {
      "code": 6002,
      "name": "RaffleNotEnded",
      "msg": "Raffle has not ended yet"
    },
    {
      "code": 6003,
      "name": "RaffleAlreadyEnded",
      "msg": "Raffle has already ended"
    },
    {
      "code": 6004,
      "name": "InsufficientPayment",
      "msg": "Insufficient payment for tickets"
    },
    {
      "code": 6005,
      "name": "NoParticipants",
      "msg": "No participants in raffle"
    },
    {
      "code": 6006,
      "name": "InvalidWinner",
      "msg": "Invalid winner account provided"
    },
    {
      "code": 6007,
      "name": "Unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6008,
      "name": "RaffleInProgress",
      "msg": "Raffle already in progress"
    }
  ]
}; 