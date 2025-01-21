-- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://redmine.postgresql.org/projects/pgadmin4/issues/new if you find any bugs, including reproduction steps.
BEGIN;


CREATE TABLE IF NOT EXISTS public.headers
(
    block_number integer NOT NULL,
    block_hash character(64) COLLATE pg_catalog."default" NOT NULL,
    extra_data character varying(64) COLLATE pg_catalog."default" NOT NULL,
    block_time timestamp without time zone NOT NULL,
    block_duration integer NOT NULL,
    transaction_count integer NOT NULL,
    txs_per_sec double precision NOT NULL,
    posdao_hbbft_epoch integer,
    reinsert_pot numeric,
    delta_pot numeric,
    reward_contract_total numeric,
    unclaimed_rewards numeric,
    governance_pot numeric,
    claiming_pot numeric,
    CONSTRAINT pk_headers_block_number PRIMARY KEY (block_number)
);

CREATE TABLE IF NOT EXISTS public.posdao_epoch
(
    id integer NOT NULL,
    block_start integer NOT NULL,
    block_end integer,
    CONSTRAINT pk_posdao_epoch_id PRIMARY KEY (id),
    CONSTRAINT uc_block_start UNIQUE (block_start),
    CONSTRAINT uc_block_end UNIQUE (block_end)
);

CREATE TABLE IF NOT EXISTS public.node
(
    pool_address bytea NOT NULL,
    mining_address bytea NOT NULL,
    mining_public_key bytea NOT NULL,
    diamond_name character varying(512),
    ens_name character varying(512),
    added_block integer NOT NULL,
    bonus_score integer,
    PRIMARY KEY (pool_address)
);

CREATE TABLE IF NOT EXISTS public.posdao_epoch_node
(
    id_node bytea NOT NULL,
    id_posdao_epoch integer NOT NULL,
    owner_reward numeric(36, 18),
    is_claimed boolean DEFAULT FALSE,
    epoch_apy numeric(36, 18) NOT NULL,
    CONSTRAINT pk_posdao_epoch_node PRIMARY KEY (id_posdao_epoch, id_node)
);

CREATE TABLE IF NOT EXISTS public.delegate_staker
(
    id bytea NOT NULL,
    CONSTRAINT "PK_Delegate_Staker" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.delegate_reward
(
    id_node bytea NOT NULL,
    id_posdao_epoch integer NOT NULL,
    id_delegator bytea NOT NULL,
    is_claimed boolean DEFAULT FALSE,
    reward_amount numeric(36, 18) NOT NULL,
    CONSTRAINT pk_delegate_reward PRIMARY KEY (id_node, id_delegator, id_posdao_epoch),
    CONSTRAINT "U_delegate_reward" UNIQUE (id_node, id_posdao_epoch, id_delegator)
);

COMMENT ON TABLE public.delegate_reward
    IS 'rewards from delegate staking';

CREATE TABLE IF NOT EXISTS public.ordered_withdrawal
(
    id serial NOT NULL,
    amount numeric(36, 18) NOT NULL,
    block_number integer,
    staking_epoch integer,
    "from_pool_stakingAddress" bytea,
    staker bytea,
    claimed_on_block integer,
    CONSTRAINT pk_ordered_withdraw PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.stake_history
(
    from_block integer,
    to_block integer,
    stake_amount numeric(36, 18) NOT NULL,
    node bytea,
    PRIMARY KEY (from_block, to_block, node)
);

CREATE TABLE IF NOT EXISTS public.pending_validator_state_event
(
    state character varying NOT NULL,
    on_enter_block_number integer NOT NULL,
    on_exit_block_number integer,
    node bytea NOT NULL,
    keygen_round integer NOT NULL,
    PRIMARY KEY (state, node, on_enter_block_number, keygen_round)
);

CREATE TABLE IF NOT EXISTS public.available_event
(
    node bytea NOT NULL,
    block integer NOT NULL,
    became_available boolean,
    CONSTRAINT pk_available_event PRIMARY KEY (node, block)
);

CREATE TABLE IF NOT EXISTS public.stake_delegators
(
    pool_address bytea NOT NULL,
    delegator bytea NOT NULL,
    total_delegated numeric(36, 18) NOT NULL,
    CONSTRAINT stake_delegators_pkey PRIMARY KEY (pool_address, delegator)
);

CREATE TABLE IF NOT EXISTS public.bonus_score_history
(
    from_block integer NOT NULL,
    to_block integer,
    node bytea NOT NULL,
    bonus_score integer NOT NULL,
    CONSTRAINT "PK_BONUS_SCORE_HISTORY" PRIMARY KEY (node, from_block)
);

COMMENT ON TABLE public.bonus_score_history
    IS 'bonus score history of a node';

ALTER TABLE IF EXISTS public.posdao_epoch
    ADD CONSTRAINT fk_block_start FOREIGN KEY (block_start)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_block_start
    ON public.posdao_epoch(block_start);


ALTER TABLE IF EXISTS public.posdao_epoch
    ADD CONSTRAINT fk_block_end FOREIGN KEY (block_end)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_block_end
    ON public.posdao_epoch(block_end);


ALTER TABLE IF EXISTS public.node
    ADD CONSTRAINT fk_added_block FOREIGN KEY (added_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_added_block
    ON public.node(added_block);


ALTER TABLE IF EXISTS public.posdao_epoch_node
    ADD FOREIGN KEY (id_node)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.posdao_epoch_node
    ADD FOREIGN KEY (id_posdao_epoch)
    REFERENCES public.posdao_epoch (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.delegate_reward
    ADD CONSTRAINT fk_posdao_epoch FOREIGN KEY (id_posdao_epoch)
    REFERENCES public.posdao_epoch (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_posdao_epoch
    ON public.delegate_reward(id_posdao_epoch);


ALTER TABLE IF EXISTS public.delegate_reward
    ADD CONSTRAINT fk_delegate_staker FOREIGN KEY (id_delegator)
    REFERENCES public.delegate_staker (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.ordered_withdrawal
    ADD CONSTRAINT "FK_Pool_Address" FOREIGN KEY ("from_pool_stakingAddress")
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.ordered_withdrawal
    ADD CONSTRAINT "FK_Staking_epoch" FOREIGN KEY (staking_epoch)
    REFERENCES public.posdao_epoch (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.ordered_withdrawal
    ADD CONSTRAINT "FK_Placed_Order" FOREIGN KEY (claimed_on_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.ordered_withdrawal
    ADD CONSTRAINT "FK_Claimed_Block" FOREIGN KEY (claimed_on_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.stake_history
    ADD CONSTRAINT "FK_From_Block" FOREIGN KEY (from_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.stake_history
    ADD CONSTRAINT "FK_To_Block" FOREIGN KEY (to_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.stake_history
    ADD CONSTRAINT "FK_Node" FOREIGN KEY (node)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.pending_validator_state_event
    ADD FOREIGN KEY (on_enter_block_number)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.pending_validator_state_event
    ADD FOREIGN KEY (on_exit_block_number)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.available_event
    ADD CONSTRAINT fk_available_event_node FOREIGN KEY (node)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.available_event
    ADD CONSTRAINT fk_available_event_block FOREIGN KEY (block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.bonus_score_history
    ADD FOREIGN KEY (from_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.bonus_score_history
    ADD FOREIGN KEY (to_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.bonus_score_history
    ADD FOREIGN KEY (node)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;