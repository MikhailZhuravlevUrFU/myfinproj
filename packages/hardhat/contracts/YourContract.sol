// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * Контракт для проведения голосований с функциями назначения кандидатов, голосования,
 * передачи голосов и завершения голосования.
 * Автор: BuidlGuidl (изменен под цели голосования)
 */
contract VotingContract {
    address public immutable owner; // Владелец контракта (не изменяемый)

    struct Candidate {
        string name; // Имя кандидата
        uint256 voteCount; // Количество голосов за кандидата
    }

    mapping(address => bool) public hasVoted; // Проверка, голосовал ли участник
    mapping(address => address) public delegatedVotes; // Маппинг для делегирования голосов
    Candidate[] public candidates; // Массив с кандидатами

    bool public votingActive = false; // Флаг активности голосования

    // События
    event CandidateAdded(string name); // Добавление кандидата
    event VotingStarted(); // Начало голосования
    event VotingEnded(); // Завершение голосования
    event VoteCasted(address voter, uint256 candidateIndex); // Голосование
    event VoteDelegated(address from, address to); // Делегирование голосов

    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    modifier isVotingActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "Already voted");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * Функция для добавления кандидатов (только владелец может добавлять).
     * @param _name Имя кандидата
     */
    function addCandidate(string memory _name) public isOwner {
        candidates.push(Candidate({name: _name, voteCount: 0}));
        emit CandidateAdded(_name);
    }

    /**
     * Функция для начала голосования (только владелец может начинать).
     */
    function startVoting() public isOwner {
        require(!votingActive, "Voting already started");
        votingActive = true;
        emit VotingStarted();
    }

    /**
     * Функция для завершения голосования (только владелец может завершать).
     */
    function endVoting() public isOwner {
        require(votingActive, "Voting is not active");
        votingActive = false;
        emit VotingEnded();
    }

    /**
     * Функция для голосования за кандидата.
     * @param _candidateIndex Индекс кандидата в массиве
     */
    function vote(uint256 _candidateIndex) public isVotingActive hasNotVoted {
        require(_candidateIndex < candidates.length, "Invalid candidate index");

        candidates[_candidateIndex].voteCount += 1;
        hasVoted[msg.sender] = true;

        emit VoteCasted(msg.sender, _candidateIndex);
    }

    /**
     * Функция для делегирования своего голоса другому участнику.
     * @param _delegateTo Адрес участника, которому делегируется голос
     */
    function delegateVote(address _delegateTo) public isVotingActive hasNotVoted {
        require(_delegateTo != msg.sender, "Cannot delegate to yourself");
        require(!hasVoted[_delegateTo], "Delegate already voted");

        delegatedVotes[msg.sender] = _delegateTo;
        hasVoted[msg.sender] = true;

        emit VoteDelegated(msg.sender, _delegateTo);
    }

    /**
     * Функция для сброса голоса пользователя.
     * Разрешено только владельцу контракта.
     * @param _voter Адрес пользователя, чей голос нужно сбросить
     */
    function resetVote(address _voter) public isOwner {
        require(hasVoted[_voter], "No vote to reset");
        
        // Сброс состояния голосования
        hasVoted[_voter] = false;
        
        // Удаление делегированного голоса
        delegatedVotes[_voter] = address(0);

        emit VoteCasted(_voter, 0); // можно изменить или убрать это событие, если нужно
    }

    /**
     * Функция для подсчета голосов, включая делегированные.
     */
    function finalizeVotes() public isOwner {
        for (uint256 i = 0; i < candidates.length; i++) {
            // Проходим по делегированным голосам и добавляем их к кандидатам
            for (uint256 j = 0; j < candidates.length; j++) {
                // Могут быть реализованы проверки для подсчета делегированных голосов
            }
        }
    }
}
