import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

export default function Polls({ polls, user }) {
  const [userVotes, setUserVotes] = useState({});
  const [selectedOption, setSelectedOption] = useState({});
  const [loadingPolls, setLoadingPolls] = useState({});

  const handleSubmitVote = useCallback(
    async (pollId, selectedOption) => {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        user_id: user.roll_no,
        selected_option: selectedOption,
      });
      if (error) {
        console.error(error);
        alert("Failed to submit vote.");
        return false;
      }
      return true;
    },
    [user]
  );

  const handleVote = useCallback(
    async (pollId) => {
      const option = selectedOption[pollId];
      if (!option) return;

      setLoadingPolls((prev) => ({ ...prev, [pollId]: true }));

      const result = await handleSubmitVote(pollId, option);
      if (result) {
        setUserVotes((prevVotes) => ({
          ...prevVotes,
          [pollId]: option,
        }));
      }
      setLoadingPolls((prev) => ({ ...prev, [pollId]: false }));
    },
    [selectedOption, setLoadingPolls, handleSubmitVote, setUserVotes]
  );

  useEffect(() => {
    const votes = {};
    polls?.forEach((poll) => {
      const userVote = poll?.poll_votes?.find(
        (vote) => vote.user_id === user?.roll_no
      );
      if (userVote) {
        votes[poll.id] = userVote.selected_option;
      }
    });
    setUserVotes(votes);
  }, [polls, user]);

  return (
    <div className="polls-container">
      <h3 className="mb-4">Polls</h3>
      {!polls?.length && (
        <div className="text-muted text-center">No Polls available!</div>
      )}
      {polls?.map((poll) => (
        <Poll
          key={poll.id}
          poll={poll}
          user={user}
          userVotedOption={userVotes[poll.id]}
          isLoading={loadingPolls[poll.id]}
          handleVote={handleVote}
          setSelectedOption={setSelectedOption}
          selectedOption={selectedOption}
        />
      ))}
    </div>
  );
}

function Poll({
  poll,
  user,
  userVotedOption,
  isLoading,
  handleVote,
  setSelectedOption,
  selectedOption,
}) {
  const hasVoted = !!userVotedOption;
  const totalVotes = poll?.poll_votes?.length;
  const percentages = poll?.options?.map((option) => {
    const count = poll?.poll_votes?.filter(
      (vote) => vote?.selected_option === option
    )?.length;
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  });

  return (
    <div className="poll mb-3 p-3 rounded shadow-sm bg-light">
      <h5 className="">{poll.title}</h5>
      <div className="mt-3">
        {poll.options.map((option, index) => {
          const inputId = `poll-${poll.id}-option-${index}`;
          return (
            <div
              key={option}
              className="form-check d-flex justify-content-between align-items-center flex-wrap"
            >
              <div>
                <input
                  className="form-check-input"
                  type="radio"
                  id={inputId}
                  name={`poll-${poll.id}`}
                  value={option}
                  onChange={(e) =>
                    setSelectedOption((prev) => ({
                      ...prev,
                      [poll.id]: e.target.value,
                    }))
                  }
                  disabled={hasVoted || isLoading}
                  checked={
                    hasVoted
                      ? userVotedOption === option
                      : selectedOption[poll.id] === option
                  }
                />
                <label className="form-check-label me-1" htmlFor={inputId}>
                  {option}
                </label>
              </div>
              {(user?.isAdmin || hasVoted) && (
                <div
                  className="progress w-75 my-1 me-lg-4"
                  role="progressbar"
                  style={{ height: "10px" }}
                >
                  <div
                    className="progress-bar progress-bar-striped"
                    style={{ width: `${percentages[index]}%` }}
                  >
                    {percentages[index]}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        {!hasVoted ? (
          <button
            className="btn btn-outline-dark"
            onClick={() => handleVote(poll.id)}
            disabled={!selectedOption[poll.id] || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        ) : (
          <p className="blockquote-footer mt-2">
            You voted: <strong>{userVotedOption}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
